using Api.Data.Context;
using Api.Enums;
using Api.Helpers;
using Api.Services;
using Api.Services.Files;
using Api.Services.Images;
using Microsoft.EntityFrameworkCore;
using Microsoft.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;

namespace Api.Endpoints.Journey;

public static class JourneyImageEndpoints
{
    [IgnoreAntiforgeryToken]
    public static async Task<IResult> UploadJourneyCoverImageAsync(
        Guid journeyId,
        IFormFile file,
        ApplicationContext context,
        IFileService fileService,
        IFileStorageService fileStorageService,
        IImageProcessingService imageProcessingService,
        IAuthenticatedUserService authenticatedUserService,
        CancellationToken ct)
    {
        var authenticatedUser = await authenticatedUserService.GetUserAsync();
        if (authenticatedUser == null)
        {
            return TypedResults.Unauthorized();
        }

        var journey = await context.Journeys
            .FirstOrDefaultAsync(j => j.Id == journeyId && j.UserId == authenticatedUser.Id && !j.IsDeleted, ct);

        if (journey == null)
            return TypedResults.NotFound($"Journey with id {journeyId} not found");

        if (file == null || file.Length == 0)
            return TypedResults.BadRequest("No file was uploaded");

        if (!file.ContentType.StartsWith("image/"))
            return TypedResults.BadRequest("File must be an image");

        if (file.Length > 10 * 1024 * 1024)
            return TypedResults.BadRequest("File size exceeds the 10MB limit");

        try
        {
            var fileId = Guid.NewGuid();
            var fileExt = Path.GetExtension(file.FileName);
            var uniqueFileName = $"{fileId}{fileExt}";

            var folderPath = $"journeys/{journeyId}/covers";
            var storagePath = $"{folderPath}/{uniqueFileName}";

            await using var fileStream = file.OpenReadStream();
            var resizedImages = await imageProcessingService.ResizeImageAsync(fileStream, file.ContentType);

            var uploadTasks = new Dictionary<ImageSizeType, Task<string>>();

            foreach (var (sizeType, (imageStream, contentType)) in resizedImages)
            {
                var sizeFileName = sizeType == ImageSizeType.Original
                    ? uniqueFileName
                    : $"{Path.GetFileNameWithoutExtension(uniqueFileName)}_{sizeType.ToString().ToLowerInvariant()}{fileExt}";

                var task = fileStorageService.UploadFileAsync(
                    imageStream,
                    sizeFileName,
                    contentType,
                    folderPath);

                uploadTasks[sizeType] = task;
            }

            await Task.WhenAll(uploadTasks.Values);

            var fileMetadata = new Data.Entities.FileMetadata
            {
                Id = fileId,
                UserId = authenticatedUser.Id,
                JourneyId = journeyId,
                FileName = file.FileName,
                ContentType = file.ContentType,
                StoragePath = storagePath,
                FileSize = file.Length,
                Type = FileType.JourneyCover,
                Visibility = FileVisibility.None
            };

            var existingCoverImage = await context.Files
                .Where(f => f.JourneyId == journeyId &&
                            f.Type == FileType.JourneyCover &&
                            !f.IsDeleted &&
                            f.Id != fileId)
                .FirstOrDefaultAsync(ct);

            if (existingCoverImage != null)
            {
                existingCoverImage.IsDeleted = true;
                existingCoverImage.DeletedAt = NodaTime.Instant.FromDateTimeUtc(DateTime.UtcNow);
            }

            journey.CoverImageId = fileId;
            journey.LastModifiedAt = NodaTime.Instant.FromDateTimeUtc(DateTime.UtcNow);

            context.Files.Add(fileMetadata);
            await context.SaveChangesAsync(ct);

            return TypedResults.NoContent();
        }
        catch (Exception ex)
        {
            return TypedResults.Problem($"Error uploading file: {ex.Message}");
        }
    }

    public static async Task<IResult> DeleteJourneyCoverImageAsync(
        Guid journeyId,
        Guid imageId,
        ApplicationContext context,
        IFileService fileService,
        IAuthenticatedUserService authenticatedUserService,
        CancellationToken ct)
    {
        var authenticatedUser = await authenticatedUserService.GetUserAsync();
        if (authenticatedUser == null)
        {
            return TypedResults.Unauthorized();
        }

        var journey = await context.Journeys
            .FirstOrDefaultAsync(j => j.Id == journeyId && j.UserId == authenticatedUser.Id && !j.IsDeleted, ct);

        if (journey == null)
            return TypedResults.NotFound($"Journey with id {journeyId} not found");

        var image = await context.Files
            .FirstOrDefaultAsync(f =>
                    f.Id == imageId &&
                    f.JourneyId == journeyId &&
                    f.Type == FileType.JourneyCover &&
                    !f.IsDeleted,
                ct);

        if (image == null)
            return TypedResults.NotFound($"Image with id {imageId} not found for journey {journeyId}");

        try
        {
            await fileService.DeleteFileAsync(imageId, authenticatedUser.Id);

            journey.LastModifiedAt = NodaTime.Instant.FromDateTimeUtc(DateTime.UtcNow);
            await context.SaveChangesAsync(ct);

            return TypedResults.NoContent();
        }
        catch (Exception ex)
        {
            return TypedResults.Problem($"Error deleting file: {ex.Message}");
        }
    }

    public static async Task<IResult> GetJourneyCoverImageAsync(
        Guid journeyId,
        Guid coverImageId,
        string imageSize,
        ApplicationContext context,
        IFileStorageService fileStorageService,
        IImageProcessingService imageProcessingService,
        IAuthenticatedUserService authenticatedUserService,
        HttpContext httpContext,
        CancellationToken ct)
    {
        if (!Enum.TryParse<ImageSizeType>(imageSize, true, out var parsedSize))
        {
            parsedSize = ImageSizeType.Original;
        }

        try
        {
            var fileRecord = await context.Files
                .FirstOrDefaultAsync(f =>
                        f.Id == coverImageId &&
                        f.Type == FileType.JourneyCover &&
                        !f.IsDeleted,
                    ct);

            if (fileRecord == null)
            {
                return TypedResults.NotFound();
            }

            if (authenticatedUserService.GetUserAsync().Result != null)
            {
                var userId = authenticatedUserService.GetUserAsync().Result!.Id;
                var journey = await context.Journeys
                    .FirstOrDefaultAsync(j => j.Id == journeyId && !j.IsDeleted, ct);

                if (journey == null)
                {
                    return TypedResults.NotFound();
                }

                if (userId != journey.UserId)
                {
                    // TODO: Implement permission check
                }
            }

            var filePath = fileRecord.StoragePath;
            if (parsedSize != ImageSizeType.Original)
            {
                var directory = Path.GetDirectoryName(fileRecord.StoragePath)?.Replace("\\", "/") ?? "";
                var fileName = Path.GetFileNameWithoutExtension(fileRecord.StoragePath);
                var extension = Path.GetExtension(fileRecord.StoragePath);
                
                var sizeSuffix = parsedSize switch
                {
                    ImageSizeType.Normal => "_normal",
                    ImageSizeType.Medium => "_medium", 
                    ImageSizeType.Small => "_small",
                    ImageSizeType.Tiny => "_tiny",
                    _ => string.Empty
                };
                
                var resizedFileName = $"{fileName}{sizeSuffix}{extension}";
                filePath = string.IsNullOrEmpty(directory) 
                    ? resizedFileName 
                    : $"{directory}/{resizedFileName}";
            }

            var etagValue = GenerateETag(fileRecord.Id, parsedSize, fileRecord.LastModifiedAt);
            var etag = new EntityTagHeaderValue($"\"{etagValue}\"");

            var ifNoneMatch = httpContext.Request.Headers.IfNoneMatch;
            if (ifNoneMatch.Contains(etag.ToString()))
            {
                return TypedResults.StatusCode(StatusCodes.Status304NotModified);
            }

            try
            {
                var (fileStream, contentType) = await fileStorageService.GetFileAsync(filePath);

                var mimeType = contentType;
                if (string.IsNullOrEmpty(mimeType))
                {
                    mimeType = GetMimeType(Path.GetExtension(fileRecord.FileName));
                }

                return TypedResults.File(
                    fileStream,
                    mimeType,
                    fileDownloadName: null,
                    lastModified: fileRecord.LastModifiedAt.ToDateTimeUtc(),
                    entityTag: etag,
                    enableRangeProcessing: true);
            }
            catch (FileNotFoundException)
            {
                if (parsedSize != ImageSizeType.Original)
                {
                    try
                    {
                        var (originalStream, originalContentType) =
                            await fileStorageService.GetFileAsync(fileRecord.StoragePath);

                        return TypedResults.File(
                            originalStream,
                            originalContentType,
                            fileDownloadName: null,
                            lastModified: fileRecord.LastModifiedAt.ToDateTimeUtc(),
                            entityTag: etag,
                            enableRangeProcessing: true);
                    }
                    catch
                    {
                        return TypedResults.NotFound();
                    }
                }

                return TypedResults.NotFound();
            }
        }
        catch (Exception ex)
        {
            return TypedResults.Problem($"Error retrieving journey cover image: {ex.Message}");
        }
    }

    private static string GenerateETag(Guid fileId, ImageSizeType size, NodaTime.Instant lastModified)
    {
        var content = $"{fileId}-{size}-{lastModified.ToUnixTimeMilliseconds()}";
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(content));
        return Convert.ToBase64String(hash)[..16];
    }

    private static string GetMimeType(string extension)
    {
        return extension.ToLower() switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".webp" => "image/webp",
            _ => "application/octet-stream"
        };
    }
}
