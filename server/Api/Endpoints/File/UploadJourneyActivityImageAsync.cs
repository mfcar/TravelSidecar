using Api.Services;
using Api.Services.Files;

namespace Api.Endpoints.File;

public static partial class FileEndpoints
{
    public static async Task<IResult> UploadJourneyActivityImageAsync(
        Guid journeyId,
        Guid activityId,
        HttpRequest request,
        IFileService fileService,
        IAuthenticatedUserService authenticatedUserService)
    {
        var userId = await authenticatedUserService.GetUserIdAsync() ?? Guid.Empty;
        if (userId == Guid.Empty) return TypedResults.Unauthorized();

        if (!request.HasFormContentType)
            return TypedResults.BadRequest("Expected form data");

        var form = await request.ReadFormAsync();
        var file = form.Files.FirstOrDefault();
        if (file == null)
            return TypedResults.BadRequest("No file uploaded");

        var fileMetadata = await fileService.UploadJourneyActivityImageAsync(
            file, userId, journeyId, activityId);

        return TypedResults.Ok(new
        {
            id = fileMetadata.Id,
            fileName = fileMetadata.FileName,
            contentType = fileMetadata.ContentType,
            fileSize = fileMetadata.FileSize
        });
    }
}
