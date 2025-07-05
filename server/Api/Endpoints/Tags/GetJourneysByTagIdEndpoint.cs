using Api.Data.Context;
using Api.DTOs;
using Api.DTOs.Journeys;
using Api.Services;
using Microsoft.EntityFrameworkCore;

namespace Api.Endpoints.Tags;

public static partial class TagEndpoints
{
    public static async Task<IResult> GetJourneysByTagIdAsync(
        Guid tagId,
        int page = 1,
        int pageSize = 25,
        HttpContext? httpContext = null,
        ApplicationContext? context = null,
        IAuthenticatedUserService? authenticatedUserService = null,
        CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(context);
        ArgumentNullException.ThrowIfNull(authenticatedUserService);
        
        var user = await authenticatedUserService.GetUserAsync();
        if (user == null)
        {
            return TypedResults.Unauthorized();
        }

        // Verify tag exists and belongs to user
        var tagExists = await context.Tags
            .AnyAsync(t => t.Id == tagId && t.UserId == user.Id, ct);
            
        if (!tagExists)
        {
            return TypedResults.NotFound();
        }

        var query = context.Journeys
            .AsNoTracking()
            .Where(j => j.UserId == user.Id && !j.IsDeleted && j.Tags.Any(t => t.Id == tagId))
            .Include(j => j.Tags)
            .Include(j => j.JourneyCategory)
            .OrderBy(j => j.Name);

        var totalCount = await query.CountAsync(ct);
        
        var journeys = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(j => new JourneyResponse
            {
                Id = j.Id,
                Name = j.Name,
                Description = j.Description,
                StartDate = j.StartDate != null ? j.StartDate.Value.ToDateOnly() : null,
                EndDate = j.EndDate != null ? j.EndDate.Value.ToDateOnly() : null,
                CreatedAt = j.CreatedAt.ToDateTimeOffset(),
                LastModifiedAt = j.LastModifiedAt.ToDateTimeOffset(),
                CategoryId = j.JourneyCategoryId,
                CategoryName = j.JourneyCategory != null ? j.JourneyCategory.Name : "",
                Tags = j.Tags.Select(t => new DTOs.Tags.TagDto
                {
                    Id = t.Id,
                    Name = t.Name,
                    Color = t.Color
                }).ToList()
            })
            .ToListAsync(ct);

        return TypedResults.Ok(new PaginatedResult<JourneyResponse>
        {
            Items = journeys,
            TotalCount = totalCount,
            PageSize = pageSize,
            CurrentPage = page
        });
    }
}