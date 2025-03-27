using Api.DTOs.Config.Files;
using Api.Enums;
using Microsoft.Extensions.Options;
using Minio;
using Minio.DataModel.Args;

namespace Api.Services.Files;

public interface IFileStorageService
{
    Task<bool> EnsureBucketExistsAsync();
    Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType, string folderPath);
    Task<(Stream Stream, string ContentType)> GetFileAsync(string storagePath);
    Task DeleteFileAsync(string storagePath, bool includeResizedVersions = false);
    string GetStoragePath(FileType type, Guid userId, Guid? journeyId, string fileName);
}

public class FileStorageService : IFileStorageService
{
    private readonly IMinioClient _minioClient;
    private readonly string _bucketName;
    private readonly ILogger<FileStorageService> _logger;

    public FileStorageService(IOptions<FileStorageOptions> fileStorageOptions, ILogger<FileStorageService> logger, IMinioClient minioClient)
    {
        var fileStorageConfig = fileStorageOptions.Value;
        
        _logger = logger;
        _minioClient = minioClient;
        _bucketName = fileStorageConfig.BucketName;
    }

    public async Task<bool> EnsureBucketExistsAsync()
    {
        try
        {
            var bucketExistsArgs = new BucketExistsArgs().WithBucket(_bucketName);
            var found = await _minioClient.BucketExistsAsync(bucketExistsArgs);
            
            if (found) return true;
            
            var makeBucketArgs = new MakeBucketArgs().WithBucket(_bucketName);
            await _minioClient.MakeBucketAsync(makeBucketArgs);
            _logger.LogInformation("Created bucket {BucketName}", _bucketName);
            
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to ensure bucket exists. Error: {Message}", ex.Message);
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

            var putObjectArgs = new PutObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(key)
                .WithStreamData(fileStream)
                .WithObjectSize(fileStream.Length)
                .WithContentType(contentType);

            var response = await _minioClient.PutObjectAsync(putObjectArgs);
        
            if (string.IsNullOrEmpty(response.Etag))
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
            var statObjectArgs = new StatObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(storagePath);

            var objectStat = await _minioClient.StatObjectAsync(statObjectArgs);

            var memoryStream = new MemoryStream();
            var getObjectArgs = new GetObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(storagePath)
                .WithCallbackStream(stream =>
                {
                    stream.CopyTo(memoryStream);
                    memoryStream.Position = 0;
                });

            await _minioClient.GetObjectAsync(getObjectArgs);

            return (memoryStream, objectStat.ContentType);
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
                
                var listObjectsArgs = new ListObjectsArgs()
                    .WithBucket(_bucketName)
                    .WithPrefix(prefix)
                    .WithRecursive(true);
                
                var objectsToDelete = new List<string>();
                
                // var items = await _minioClient.ListObjectsAsync(listObjectsArgs).ToListAsync();
                // foreach (var item in items)
                // {
                //     if (item.Key == storagePath || 
                //         item.Key.EndsWith($"_normal{extension}") ||
                //         item.Key.EndsWith($"_medium{extension}") ||
                //         item.Key.EndsWith($"_small{extension}") ||
                //         item.Key.EndsWith($"_smallest{extension}"))
                //     {
                //         objectsToDelete.Add(item.Key);
                //     }
                // }
                
                var deleteTasks = objectsToDelete.Select(async key => {
                    try
                    {
                        var removeObjectArgs = new RemoveObjectArgs()
                            .WithBucket(_bucketName)
                            .WithObject(key);
                        
                        await _minioClient.RemoveObjectAsync(removeObjectArgs);
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
                var removeObjectArgs = new RemoveObjectArgs()
                    .WithBucket(_bucketName)
                    .WithObject(storagePath);

                await _minioClient.RemoveObjectAsync(removeObjectArgs);
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
