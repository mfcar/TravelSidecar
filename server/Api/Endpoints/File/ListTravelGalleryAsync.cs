using Api.DTOs;
using Api.DTOs.Files;
using Api.Services;
using Api.Services.Files;

namespace Api.Endpoints.File;

public static partial class FileEndpoints
{
    public static async Task<IResult> ListJourneyGalleryAsync(
        Guid journeyId,
        int? page,
        int? pageSize,
        string? searchTerm,
        string? sortBy,
        string? sortOrder,
        IFileService fileService,
        IAuthenticatedUserService authenticatedUserService,
        CancellationToken ct)
    {
        var userId = await authenticatedUserService.GetUserIdAsync() ?? Guid.Empty;
        if (userId == Guid.Empty) return TypedResults.Unauthorized();

        var queryParameters = new FileQueryParameters
        {
            Page = page ?? 1,
            PageSize = pageSize ?? 25,
            SearchTerm = searchTerm,
            SortBy = sortBy,
            SortOrder = sortOrder
        };

        var paginatedFiles = await fileService.GetJourneyGalleryAsync(journeyId, userId, queryParameters, ct);

        var result = new PaginatedResult<object>
        {
            Items = paginatedFiles.Items.Select(f => new
            {
                id = f.Id,
                fileName = f.FileName,
                contentType = f.ContentType,
                fileSize = f.FileSize,
                category = f.Category.ToString(),
                uploadDate = f.CreatedAt
            }),
            TotalCount = paginatedFiles.TotalCount,
            PageSize = paginatedFiles.PageSize,
            CurrentPage = paginatedFiles.CurrentPage
        };

        return TypedResults.Ok(result);
    }
}
