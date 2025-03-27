using Api.Services;
using Api.Services.Files;

namespace Api.Endpoints.File;

public static partial class FileEndpoints
{
    public static async Task<IResult> GetImageAsync(
        Guid fileId,
        IFileService fileService,
        IAuthenticatedUserService authenticatedUserService)
    {
        var userId = await authenticatedUserService.GetUserIdAsync() ?? Guid.Empty;
        if (userId == Guid.Empty) return TypedResults.Unauthorized();

        try
        {
            var (stream, contentType, _) = await fileService.GetFileAsync(fileId, userId);

            if (!contentType.StartsWith("image/"))
            {
                return TypedResults.BadRequest("Requested file is not an image");
            }

            return TypedResults.File(
                fileStream: stream,
                contentType: contentType,
                enableRangeProcessing: true);
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
