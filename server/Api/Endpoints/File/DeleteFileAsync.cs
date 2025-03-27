using Api.Services;
using Api.Services.Files;

namespace Api.Endpoints.File;

public static partial class FileEndpoints
{
    public static async Task<IResult> DeleteFileAsync(
        Guid fileId,
        IFileService fileService,
        IAuthenticatedUserService authenticatedUserService)
    {
        var userId = await authenticatedUserService.GetUserIdAsync() ?? Guid.Empty;
        if (userId == Guid.Empty) return TypedResults.Unauthorized();
        
        try
        {
            var result = await fileService.DeleteFileAsync(fileId, userId);
            return result ? TypedResults.Ok() : TypedResults.NotFound();
        }
        catch (UnauthorizedAccessException)
        {
            return TypedResults.Forbid();
        }
    }
}
