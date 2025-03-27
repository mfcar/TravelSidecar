using Api.Services;
using Api.Services.Files;

namespace Api.Endpoints.File;

public static partial class FileEndpoints
{
    public static async Task<IResult> GetFileAsync(
        Guid fileId,
        IFileService fileService,
        IAuthenticatedUserService authenticatedUserService)
    {
        var userId = await authenticatedUserService.GetUserIdAsync() ?? Guid.Empty;
        if (userId == Guid.Empty) return TypedResults.Unauthorized();

        try
        {
            var (stream, contentType, fileName) = await fileService.GetFileAsync(fileId, userId);

            return TypedResults.File(
                fileStream: stream,
                contentType: contentType,
                fileDownloadName: fileName);
        }
        catch (FileNotFoundException)
        {
            return TypedResults.NotFound();
        }
        catch (UnauthorizedAccessException)
        {
            return TypedResults.Forbid();
        }
    }
}
