using Api.Data.Context;
using Api.DTOs.BucketListItems;
using Api.DTOs.Journeys;
using Api.DTOs.Tags;
using Api.Services;
using Microsoft.EntityFrameworkCore;

namespace Api.Endpoints.Tags;

public static partial class TagEndpoints
{
    public static async Task<IResult> GetTagByTagIdAsync(
        Guid tagId,
        HttpContext httpContext,
        ApplicationContext context,
        IAuthenticatedUserService authenticatedUserService,
        CancellationToken ct)
    {
        var user = await authenticatedUserService.GetUserAsync();
        if (user == null)
        {
            return TypedResults.Unauthorized();
        }

        var tag = await context.Tags
            .AsNoTracking()
            .Include(t => t.Journeys.Where(j => !j.IsDeleted))
            .Include(t => t.BucketListItems.Where(b => !b.IsDeleted))
            .FirstOrDefaultAsync(t => t.Id == tagId && t.UserId == user.Id, ct);

        if (tag == null)
        {
            return TypedResults.NotFound();
        }

        var response = new CreateUpdateTagResponse
        {
            Id = tag.Id,
            Name = tag.Name,
            Color = tag.Color,
            CreatedAt = tag.CreatedAt.ToDateTimeOffset(),
            LastModifiedAt = tag.LastModifiedAt.ToDateTimeOffset(),
            JourneysCount = tag.Journeys.Count,
            BucketListItemCount = tag.BucketListItems.Count,
            JourneysList = tag.Journeys.Select(j => new JourneyResponse
            {
                Id = j.Id,
                Name = j.Name,
                Description = j.Description,
                StartDate = j.StartDate?.ToDateOnly(),
                EndDate = j.EndDate?.ToDateOnly(),
                CreatedAt = j.CreatedAt.ToDateTimeOffset(),
                LastModifiedAt = j.LastModifiedAt.ToDateTimeOffset(),
                CategoryId = j.JourneyCategoryId
            }).ToList(),
            BucketListItemsList = tag.BucketListItems.Select(b => new BucketListItemResponse
            {
                Id = b.Id,
                Name = b.Name,
                Description = b.Description,
                Type = b.Type,
                BucketListId = b.BucketListId,
                StartDate = b.StartDate?.ToDateOnly(),
                StartTimeUtc = b.StartTimeUtc,
                StartTimeZoneId = b.StartTimeZoneId,
                EndDate = b.EndDate?.ToDateOnly(),
                EndTimeUtc = b.EndTimeUtc,
                EndTimeZoneId = b.EndTimeZoneId,
                OriginalPrice = b.OriginalPrice,
                OriginalCurrencyCode = b.OriginalCurrencyCode,
                ImageId = b.ImageId,
                CreatedAt = b.CreatedAt.ToDateTimeOffset(),
                UpdatedAt = b.UpdatedAt.ToDateTimeOffset()
            }).ToList()
        };

        return TypedResults.Ok(response);
    }
}
