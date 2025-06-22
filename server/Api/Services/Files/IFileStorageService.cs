using Api.Enums;

namespace Api.Services.Files;

public interface IFileStorageService
{
    Task<bool> EnsureBucketExistsAsync();
    Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType, string folderPath);
    Task<(Stream Stream, string ContentType)> GetFileAsync(string storagePath);
    Task DeleteFileAsync(string storagePath, bool includeResizedVersions = false);
    string GetStoragePath(FileType type, Guid userId, Guid? journeyId, string fileName);
}
