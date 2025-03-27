using Api.Enums;
using Api.Services;
using Api.Services.Files;

namespace Api.Endpoints.File;

public static partial class FileEndpoints
{
    public static async Task<IResult> UploadFileAsync(
        HttpRequest request,
        IFileService fileService,
        IAuthenticatedUserService authenticatedUserService)
    {
        var userId = await authenticatedUserService.GetUserIdAsync() ?? Guid.Empty;
        if (userId == Guid.Empty) return TypedResults.Unauthorized();

        if (!request.HasFormContentType)
        {
            return TypedResults.BadRequest("Expected form data");
        }

        var form = await request.ReadFormAsync();
        var file = form.Files.FirstOrDefault();

        if (file == null)
        {
            return TypedResults.BadRequest("No file uploaded");
        }

        if (!Enum.TryParse<FileCategory>(form["category"], out var category))
        {
            category = FileCategory.Other;
        }

        if (!Enum.TryParse<FileType>(form["type"], out var type))
        {
            type = FileType.Other;
        }

        Guid? journeyId = null;
        if (Guid.TryParse(form["journeyId"], out var parsedJourneyId))
        {
            journeyId = parsedJourneyId;
        }

        var fileMetadata = await fileService.UploadFileAsync(file, userId, type, category, journeyId);

        return TypedResults.Ok(new
        {
            id = fileMetadata.Id,
            fileName = fileMetadata.FileName,
            contentType = fileMetadata.ContentType,
            fileSize = fileMetadata.FileSize,
            category = fileMetadata.Category.ToString(),
            uploadDate = fileMetadata.CreatedAt
        });
    }
}
