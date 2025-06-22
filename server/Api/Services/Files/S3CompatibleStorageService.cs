using Amazon.S3;
using Amazon.S3.Model;
using Api.DTOs.Config.Files;
using Api.Enums;
using Microsoft.Extensions.Options;

namespace Api.Services.Files;

public class S3CompatibleStorageService : IFileStorageService
{
    private readonly IAmazonS3 _s3Client;
    private readonly string _bucketName;
    private readonly ILogger<S3CompatibleStorageService> _logger;

    public S3CompatibleStorageService(
        IAmazonS3 s3Client,
        IOptions<FileStorageOptions> fileStorageOptions,
        ILogger<S3CompatibleStorageService> logger)
    {
        _s3Client = s3Client;
        _bucketName = fileStorageOptions.Value.BucketName;
        _logger = logger;
    }

    public async Task<bool> EnsureBucketExistsAsync()
    {
        try
        {
            await _s3Client.GetBucketLocationAsync(_bucketName);
            return true;
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            try
            {
                await _s3Client.PutBucketAsync(_bucketName);
                _logger.LogInformation("Created bucket {BucketName}", _bucketName);
                return true;
            }
            catch (Exception createEx)
            {
                _logger.LogError(createEx, "Failed to create bucket {BucketName}. Error: {Message}", _bucketName, createEx.Message);
                return false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to check if bucket exists. Error: {Message}", ex.Message);
            return false;
        }
    }

    public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType, string folderPath)
    {
        ArgumentNullException.ThrowIfNull(fileStream);
        ArgumentException.ThrowIfNullOrEmpty(fileName);
        ArgumentException.ThrowIfNullOrEmpty(contentType);
        ArgumentException.ThrowIfNullOrEmpty(folderPath);

        fileName = Path.GetFileName(fileName);
    
        try
        {
            if (!await EnsureBucketExistsAsync())
            {
                throw new InvalidOperationException($"Cannot upload file. Storage bucket '{_bucketName}' doesn't exist or couldn't be created.");
            }

            var key = string.Join("/", folderPath.TrimEnd('/'), fileName);

            if (fileStream.CanSeek && fileStream.Position != 0)
                fileStream.Position = 0;

            var request = new PutObjectRequest
            {
                BucketName = _bucketName,
                Key = key,
                InputStream = fileStream,
                ContentType = contentType,
                ServerSideEncryptionMethod = ServerSideEncryptionMethod.None
            };

            var response = await _s3Client.PutObjectAsync(request);
        
            if (string.IsNullOrEmpty(response.ETag))
            {
                throw new InvalidOperationException($"Upload failed for file {fileName}. No ETag returned.");
            }

            return key;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file {FileName}. Error: {Message}", fileName, ex.Message);
            throw;
        }
    }

    public async Task<(Stream Stream, string ContentType)> GetFileAsync(string storagePath)
    {
        try
        {
            var request = new GetObjectRequest
            {
                BucketName = _bucketName,
                Key = storagePath
            };

            var response = await _s3Client.GetObjectAsync(request);
            
            var memoryStream = new MemoryStream();
            await response.ResponseStream.CopyToAsync(memoryStream);
            memoryStream.Position = 0;

            return (memoryStream, response.Headers.ContentType);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting file {Path}, Error: {Message}", storagePath, ex.Message);
            throw;
        }
    }

    public async Task DeleteFileAsync(string storagePath, bool includeResizedVersions = false)
    {
        try
        {
            if (includeResizedVersions)
            {
                var directory = Path.GetDirectoryName(storagePath)?.Replace("\\", "/") ?? "";
                var fileNameWithoutExt = Path.GetFileNameWithoutExtension(storagePath);
                var extension = Path.GetExtension(storagePath);
                var prefix = string.IsNullOrEmpty(directory) 
                    ? fileNameWithoutExt 
                    : $"{directory}/{fileNameWithoutExt}";
                
                var listRequest = new ListObjectsV2Request
                {
                    BucketName = _bucketName,
                    Prefix = prefix,
                    MaxKeys = 1000
                };
                
                var objectsToDelete = new List<string>();
                
                var response = await _s3Client.ListObjectsV2Async(listRequest);
                foreach (var obj in response.S3Objects)
                {
                    if (obj.Key == storagePath || 
                        obj.Key.EndsWith($"_normal{extension}") ||
                        obj.Key.EndsWith($"_medium{extension}") ||
                        obj.Key.EndsWith($"_small{extension}") ||
                        obj.Key.EndsWith($"_smallest{extension}"))
                    {
                        objectsToDelete.Add(obj.Key);
                    }
                }
                
                var deleteTasks = objectsToDelete.Select(async key => {
                    try
                    {
                        var deleteRequest = new DeleteObjectRequest
                        {
                            BucketName = _bucketName,
                            Key = key
                        };
                        
                        await _s3Client.DeleteObjectAsync(deleteRequest);
                        _logger.LogInformation("Deleted file {Path}", key);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to delete file {Path}: {Message}", key, ex.Message);
                    }
                });
                
                await Task.WhenAll(deleteTasks);
            }
            else
            {
                var deleteRequest = new DeleteObjectRequest
                {
                    BucketName = _bucketName,
                    Key = storagePath
                };

                await _s3Client.DeleteObjectAsync(deleteRequest);
                _logger.LogInformation("Deleted file {Path}", storagePath);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file(s) {Path}, Error: {Message}", storagePath, ex.Message);
            throw;
        }
    }

    public string GetStoragePath(FileType type, Guid userId, Guid? journeyId, string fileName)
    {
        var path = type switch
        {
            FileType.UserAvatar => $"avatars/{userId}",
            FileType.JourneyCover => $"journeys/{journeyId}/covers",
            FileType.JourneyDocument => $"journeys/{journeyId}/docs",
            FileType.JourneyPhoto => $"journeys/{journeyId}/photos",
            FileType.JourneyActivityImage => $"journeys/{journeyId}/actvt-images",
            FileType.JourneyActivityDocument => $"journeys/{journeyId}/actvt-docs",
            FileType.BucketListItemImage => $"bucket-list-items/{userId}",
            _ => $"other/user-{userId}"
        };

        return Path.Combine(path, fileName).Replace("\\", "/");
    }
}
