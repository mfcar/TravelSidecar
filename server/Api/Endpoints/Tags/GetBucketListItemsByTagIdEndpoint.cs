using Api.Data.Context;
using Api.DTOs;
using Api.DTOs.BucketListItems;
using Api.Services;
using Microsoft.EntityFrameworkCore;

namespace Api.Endpoints.Tags;

public static partial class TagEndpoints
{
    public static async Task<IResult> GetBucketListItemsByTagIdAsync(
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

        var query = context.BucketListItems
            .AsNoTracking()
            .Where(b => b.UserId == user.Id && !b.IsDeleted && b.Tags.Any(t => t.Id == tagId))
            .Include(b => b.Tags)
            .OrderBy(b => b.Name);

        var totalCount = await query.CountAsync(ct);
        
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(b => new BucketListItemResponse
            {
                Id = b.Id,
                Name = b.Name,
                Description = b.Description,
                Type = b.Type,
                BucketListId = b.BucketListId,
                StartDate = b.StartDate != null ? b.StartDate.Value.ToDateOnly() : null,
                StartTimeUtc = b.StartTimeUtc,
                StartTimeZoneId = b.StartTimeZoneId,
                EndDate = b.EndDate != null ? b.EndDate.Value.ToDateOnly() : null,
                EndTimeUtc = b.EndTimeUtc,
                EndTimeZoneId = b.EndTimeZoneId,
                OriginalPrice = b.OriginalPrice,
                OriginalCurrencyCode = b.OriginalCurrencyCode,
                ImageId = b.ImageId,
                CreatedAt = b.CreatedAt.ToDateTimeOffset(),
                UpdatedAt = b.UpdatedAt.ToDateTimeOffset(),
                Tags = b.Tags.Select(t => new DTOs.Tags.TagDto
                {
                    Id = t.Id,
                    Name = t.Name,
                    Color = t.Color
                }).ToList()
            })
            .ToListAsync(ct);

        return TypedResults.Ok(new PaginatedResult<BucketListItemResponse>
        {
            Items = items,
            TotalCount = totalCount,
            PageSize = pageSize,
            CurrentPage = page
        });
    }
}