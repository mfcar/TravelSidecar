using System.Linq.Expressions;
using Api.Data.Context;
using Api.Data.Entities;
using Api.DTOs;
using Api.DTOs.Files;
using Api.Enums;
using Api.Helpers;
using Microsoft.EntityFrameworkCore;

namespace Api.Services.Files;

public interface IFileService
{
    Task<FileMetadata> UploadFileAsync(IFormFile file, Guid userId, FileType type, FileCategory category,
        Guid? journeyId = null);

    Task<FileMetadata> UploadBucketListItemImageAsync(IFormFile file, Guid userId, Guid bucketListItemId);

    Task<FileMetadata>
        UploadJourneyActivityImageAsync(IFormFile file, Guid userId, Guid journeyId, Guid journeyActivityId);

    Task<FileMetadata> UploadJourneyActivityDocumentAsync(IFormFile file, Guid userId, Guid journeyId,
        Guid journeyActivityId,
        FileCategory category);

    Task<(Stream Stream, string ContentType, string FileName)> GetFileAsync(Guid fileId, Guid userId);

    Task<bool> DeleteFileAsync(Guid fileId, Guid userId);

    Task<PaginatedResult<FileMetadata>> GetFilesByJourneyAsync(
        Guid journeyId,
        Guid userId,
        FileQueryParameters parameters,
        FileType? type = null,
        FileCategory? category = null,
        CancellationToken ct = default);

    Task<PaginatedResult<FileMetadata>> GetFilesByUserAsync(
        Guid userId,
        FileQueryParameters parameters,
        FileType? type = null,
        CancellationToken ct = default);

    Task<PaginatedResult<FileMetadata>> GetJourneyGalleryAsync(
        Guid journeyId,
        Guid userId,
        FileQueryParameters parameters,
        CancellationToken ct = default);

    Task<PaginatedResult<FileMetadata>> GetJourneyDocumentsAsync(
        Guid journeyId,
        Guid userId,
        FileQueryParameters parameters,
        CancellationToken ct = default);
}

public class FileService : IFileService
{
    private readonly ApplicationContext _dbContext;
    private readonly IFileStorageService _storageService;
    private readonly IFileEncryptionService _encryptionService;
    private readonly ILogger<FileService> _logger;

    public FileService(
        ApplicationContext dbContext,
        IFileStorageService storageService,
        IFileEncryptionService encryptionService,
        ILogger<FileService> logger)
    {
        _dbContext = dbContext;
        _storageService = storageService;
        _encryptionService = encryptionService;
        _logger = logger;
    }

    public async Task<FileMetadata> UploadFileAsync(IFormFile file, Guid userId, FileType type, FileCategory category,
        Guid? journeyId = null)
    {
        var fileId = Guid.NewGuid();
        var fileExt = Path.GetExtension(file.FileName);
        var uniqueFileName = $"{fileId}{fileExt}";

        var storagePath = _storageService.GetStoragePath(type, userId, journeyId, uniqueFileName);

        var shouldEncrypt = _encryptionService.ShouldEncrypt(file.ContentType, type);

        string? encryptionKeyId = null;

        await using var fileStream = file.OpenReadStream();

        if (shouldEncrypt)
        {
            var (encryptedStream, keyId) = _encryptionService.EncryptFile(fileStream, fileId.ToString());
            encryptionKeyId = keyId;

            await _storageService.UploadFileAsync(
                encryptedStream,
                uniqueFileName,
                file.ContentType,
                Path.GetDirectoryName(storagePath)?.Replace("\\", "/") ?? "");
        }
        else
        {
            await _storageService.UploadFileAsync(
                fileStream,
                uniqueFileName,
                file.ContentType,
                Path.GetDirectoryName(storagePath)?.Replace("\\", "/") ?? "");
        }

        var fileMetadata = new FileMetadata
        {
            FileName = file.FileName,
            ContentType = file.ContentType,
            FileSize = file.Length,
            StoragePath = storagePath,
            Visibility = type == FileType.UserAvatar ? FileVisibility.Public : FileVisibility.Private,
            Type = type,
            Category = category,
            IsEncrypted = shouldEncrypt,
            EncryptionKeyId = encryptionKeyId,
            UserId = userId,
            JourneyId = journeyId
        };

        _dbContext.Files.Add(fileMetadata);
        await _dbContext.SaveChangesAsync();

        return fileMetadata;
    }

    public async Task<FileMetadata> UploadBucketListItemImageAsync(
        IFormFile file,
        Guid userId,
        Guid bucketListItemId)
    {
        var fileMetadata = await UploadFileAsync(
            file,
            userId,
            FileType.BucketListItemImage,
            FileCategory.Other);

        var bucketListItem = await _dbContext.BucketListItems
            .FirstOrDefaultAsync(b => b.Id == bucketListItemId && b.UserId == userId);

        if (bucketListItem != null)
        {
            bucketListItem.ImageId = fileMetadata.Id;
            await _dbContext.SaveChangesAsync();
        }

        return fileMetadata;
    }

    public async Task<FileMetadata> UploadJourneyActivityImageAsync(
        IFormFile file,
        Guid userId,
        Guid journeyId,
        Guid journeyActivityId)
    {
        var fileMetadata = await UploadFileAsync(
            file,
            userId,
            FileType.JourneyActivityImage,
            FileCategory.Other,
            journeyId);

        // var activity = await _dbContext.JourneyActivities
        //     .FirstOrDefaultAsync(a => a.Id == journeyActivityId && a.UserId == userId);
        //
        // if (activity != null)
        // {
        //     activity.ImageFileId = fileMetadata.Id;
        //     await _dbContext.SaveChangesAsync();
        // }

        return fileMetadata;
    }

    public async Task<FileMetadata> UploadJourneyActivityDocumentAsync(
        IFormFile file,
        Guid userId,
        Guid journeyId,
        Guid journeyActivityId,
        FileCategory category)
    {
        var fileMetadata = await UploadFileAsync(
            file,
            userId,
            FileType.JourneyActivityDocument,
            category,
            journeyId);

        // var activity = await _dbContext.JourneyActivities
        //     .FirstOrDefaultAsync(a => a.Id == journeyActivityId && a.UserId == userId);
        //
        // if (activity != null)
        // {
        //     activity.DocumentFileId = fileMetadata.Id;
        //     await _dbContext.SaveChangesAsync();
        // }

        return fileMetadata;
    }

    public async Task<(Stream Stream, string ContentType, string FileName)> GetFileAsync(Guid fileId, Guid userId)
    {
        var file = await (from f in _dbContext.Files.AsNoTracking()
            where f.Id == fileId && !f.IsDeleted
            select f).FirstOrDefaultAsync();

        if (file == null)
        {
            throw new FileNotFoundException($"File with ID {fileId} not found");
        }

        if (file.Visibility == FileVisibility.Private && file.UserId != userId)
        {
            throw new UnauthorizedAccessException("You don't have permission to access this file");
        }

        try
        {
            var (fileStream, contentType) = await _storageService.GetFileAsync(file.StoragePath);

            if (file.IsEncrypted && !string.IsNullOrEmpty(file.EncryptionKeyId))
            {
                fileStream = _encryptionService.DecryptFile(fileStream, file.EncryptionKeyId);
            }

            if (file.StorageStatus == FileStorageStatus.Available) return (fileStream, contentType, file.FileName);

            file.StorageStatus = FileStorageStatus.Available;
            await _dbContext.SaveChangesAsync();

            return (fileStream, contentType, file.FileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve file {FileId} from storage", fileId);

            file.StorageStatus = FileStorageStatus.Unavailable;
            await _dbContext.SaveChangesAsync();

            throw;
        }
    }

    public async Task<bool> DeleteFileAsync(Guid fileId, Guid userId)
    {
        var file = await _dbContext.Files.FirstOrDefaultAsync(f => f.Id == fileId);

        if (file == null)
        {
            return false;
        }

        if (file.UserId != userId)
        {
            throw new UnauthorizedAccessException("You don't have permission to delete this file");
        }

        await _storageService.DeleteFileAsync(file.StoragePath);

        file.IsDeleted = true;
        await _dbContext.SaveChangesAsync();

        return true;
    }

    public async Task<PaginatedResult<FileMetadata>> GetFilesByJourneyAsync(
        Guid journeyId,
        Guid userId,
        FileQueryParameters parameters,
        FileType? type = null,
        FileCategory? category = null,
        CancellationToken ct = default)
    {
        var query = from file in _dbContext.Files.AsNoTracking()
            where file.JourneyId == journeyId &&
                  (file.UserId == userId || file.Visibility == FileVisibility.Public) &&
                  !file.IsDeleted
            select file;

        if (type.HasValue)
        {
            query = query.Where(file => file.Type == type.Value);
        }

        if (category.HasValue)
        {
            query = query.Where(file => file.Category == category.Value);
        }

        if (!string.IsNullOrWhiteSpace(parameters.SearchTerm))
        {
            var searchPattern = $"%{parameters.SearchTerm}%";
            query = query.Where(file => EF.Functions.ILike(file.FileName, searchPattern));
        }

        var validSortColumns =
            new Dictionary<string, Expression<Func<FileMetadata, object>>>(StringComparer.OrdinalIgnoreCase)
            {
                { "FileName", f => f.FileName },
                { "ContentType", f => f.ContentType },
                { "FileSize", f => f.FileSize },
                { "CreatedAt", f => f.CreatedAt }
            };

        if (!string.IsNullOrWhiteSpace(parameters.SortBy) &&
            validSortColumns.TryGetValue(parameters.SortBy, out var sortExpression))
        {
            var descending = string.Equals(parameters.SortOrder, "desc", StringComparison.OrdinalIgnoreCase);
            query = descending ? query.OrderByDescending(sortExpression) : query.OrderBy(sortExpression);
        }
        else
        {
            query = query.OrderByDescending(f => f.CreatedAt);
        }

        return await query.ToPaginatedResultAsync(parameters, f => f, ct);
    }

    public async Task<PaginatedResult<FileMetadata>> GetFilesByUserAsync(
        Guid userId,
        FileQueryParameters parameters,
        FileType? type = null,
        CancellationToken ct = default)
    {
        var query = from file in _dbContext.Files.AsNoTracking()
            where file.UserId == userId && !file.IsDeleted
            select file;

        if (type.HasValue)
        {
            query = query.Where(file => file.Type == type.Value);
        }

        if (!string.IsNullOrWhiteSpace(parameters.SearchTerm))
        {
            var searchPattern = $"%{parameters.SearchTerm}%";
            query = query.Where(file => EF.Functions.ILike(file.FileName, searchPattern));
        }

        var validSortColumns =
            new Dictionary<string, Expression<Func<FileMetadata, object>>>(StringComparer.OrdinalIgnoreCase)
            {
                { "FileName", f => f.FileName },
                { "ContentType", f => f.ContentType },
                { "FileSize", f => f.FileSize },
                { "CreatedAt", f => f.CreatedAt }
            };

        if (!string.IsNullOrWhiteSpace(parameters.SortBy) &&
            validSortColumns.TryGetValue(parameters.SortBy, out var sortExpression))
        {
            var descending = string.Equals(parameters.SortOrder, "desc", StringComparison.OrdinalIgnoreCase);
            query = descending ? query.OrderByDescending(sortExpression) : query.OrderBy(sortExpression);
        }
        else
        {
            query = query.OrderByDescending(f => f.CreatedAt);
        }

        return await query.ToPaginatedResultAsync(parameters, f => f, ct);
    }

    public async Task<PaginatedResult<FileMetadata>> GetJourneyGalleryAsync(
        Guid journeyId,
        Guid userId,
        FileQueryParameters parameters,
        CancellationToken ct = default)
    {
        var query = from file in _dbContext.Files.AsNoTracking()
            where file.JourneyId == journeyId &&
                  (file.UserId == userId || file.Visibility == FileVisibility.Public) &&
                  !file.IsDeleted &&
                  file.Type == FileType.JourneyPhoto
            select file;

        if (!string.IsNullOrWhiteSpace(parameters.SearchTerm))
        {
            var searchPattern = $"%{parameters.SearchTerm}%";
            query = query.Where(file => EF.Functions.ILike(file.FileName, searchPattern));
        }

        var validSortColumns =
            new Dictionary<string, Expression<Func<FileMetadata, object>>>(StringComparer.OrdinalIgnoreCase)
            {
                { "FileName", f => f.FileName },
                { "ContentType", f => f.ContentType },
                { "FileSize", f => f.FileSize },
                { "CreatedAt", f => f.CreatedAt }
            };

        if (!string.IsNullOrWhiteSpace(parameters.SortBy) &&
            validSortColumns.TryGetValue(parameters.SortBy, out var sortExpression))
        {
            var descending = string.Equals(parameters.SortOrder, "desc", StringComparison.OrdinalIgnoreCase);
            query = descending ? query.OrderByDescending(sortExpression) : query.OrderBy(sortExpression);
        }
        else
        {
            query = query.OrderByDescending(f => f.CreatedAt);
        }

        return await query.ToPaginatedResultAsync(parameters, f => f, ct);
    }

    public async Task<PaginatedResult<FileMetadata>> GetJourneyDocumentsAsync(
        Guid journeyId,
        Guid userId,
        FileQueryParameters parameters,
        CancellationToken ct = default)
    {
        var query = from file in _dbContext.Files.AsNoTracking()
            where file.JourneyId == journeyId &&
                  (file.UserId == userId || file.Visibility == FileVisibility.Public) &&
                  !file.IsDeleted &&
                  (file.Type == FileType.JourneyDocument ||
                   file.Type == FileType.JourneyActivityDocument)
            select file;

        if (!string.IsNullOrWhiteSpace(parameters.SearchTerm))
        {
            var searchPattern = $"%{parameters.SearchTerm}%";
            query = query.Where(file => EF.Functions.ILike(file.FileName, searchPattern));
        }

        var validSortColumns =
            new Dictionary<string, Expression<Func<FileMetadata, object>>>(StringComparer.OrdinalIgnoreCase)
            {
                { "FileName", f => f.FileName },
                { "ContentType", f => f.ContentType },
                { "FileSize", f => f.FileSize },
                { "CreatedAt", f => f.CreatedAt }
            };

        if (!string.IsNullOrWhiteSpace(parameters.SortBy) &&
            validSortColumns.TryGetValue(parameters.SortBy, out var sortExpression))
        {
            var descending = string.Equals(parameters.SortOrder, "desc", StringComparison.OrdinalIgnoreCase);
            query = descending ? query.OrderByDescending(sortExpression) : query.OrderBy(sortExpression);
        }
        else
        {
            query = query.OrderByDescending(f => f.CreatedAt);
        }

        return await query.ToPaginatedResultAsync(parameters, f => f, ct);
    }
}
