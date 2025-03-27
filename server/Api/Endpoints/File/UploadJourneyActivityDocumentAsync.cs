using Api.Enums;
using Api.Services;
using Api.Services.Files;

namespace Api.Endpoints.File;

public static partial class FileEndpoints
{
    public static async Task<IResult> UploadJourneyActivityDocumentAsync(
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

        if (!Enum.TryParse<FileCategory>(form["category"], out var category))
            category = FileCategory.Other;

        var fileMetadata = await fileService.UploadJourneyActivityDocumentAsync(
            file, userId, journeyId, activityId, category);

        return TypedResults.Ok(new
        {
            id = fileMetadata.Id,
            fileName = fileMetadata.FileName,
            contentType = fileMetadata.ContentType,
            fileSize = fileMetadata.FileSize,
            category = fileMetadata.Category.ToString()
        });
    }
}
