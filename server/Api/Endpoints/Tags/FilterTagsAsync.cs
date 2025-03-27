using Api.Data.Context;
using Api.DTOs;
using Api.DTOs.Tags;
using Api.Helpers;
using Api.Services;
using Microsoft.EntityFrameworkCore;

namespace Api.Endpoints.Tags;

public static partial class TagEndpoints
{
    public static async Task<IResult> FilterTagsAsync(
        TagFilterRequest filters,
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

        var query = context.Tags
            .AsNoTracking()
            .Where(t => t.UserId == user.Id);

        if (!string.IsNullOrWhiteSpace(filters.SearchTerm))
        {
            query = query.Where(t => EF.Functions.ILike(t.Name, $"%{filters.SearchTerm}%"));
        }

        var projection = query.Select(t => new
        {
            Tag = t,
            JourneysCount = t.Journeys.Count,
            BucketListItemsCount = t.BucketListItems.Count
        });

        projection = filters.UsedInBucketListItems switch
        {
            true => projection.Where(x => x.BucketListItemsCount > 0),
            false => projection.Where(x => x.BucketListItemsCount == 0),
            _ => filters.UsedInJourneys switch
            {
                true => projection.Where(x => x.JourneysCount > 0),
                false => projection.Where(x => x.JourneysCount == 0),
                _ => projection
            }
        };

        var descending = string.Equals(filters.SortOrder, "desc", StringComparison.OrdinalIgnoreCase);
        if (!string.IsNullOrWhiteSpace(filters.SortBy))
        {
            projection = filters.SortBy.ToLower() switch
            {
                "name" => descending
                    ? projection.OrderByDescending(x => x.Tag.Name)
                    : projection.OrderBy(x => x.Tag.Name),
                "journeyscount" => descending
                    ? projection.OrderByDescending(x => x.JourneysCount)
                    : projection.OrderBy(x => x.JourneysCount),
                "bucketlistitemcount" => descending
                    ? projection.OrderByDescending(x => x.BucketListItemsCount)
                    : projection.OrderBy(x => x.BucketListItemsCount),
                "createdat" => descending
                    ? projection.OrderByDescending(x => x.Tag.CreatedAt)
                    : projection.OrderBy(x => x.Tag.CreatedAt),
                "lastmodifiedat" => descending
                    ? projection.OrderByDescending(x => x.Tag.LastModifiedAt)
                    : projection.OrderBy(x => x.Tag.LastModifiedAt),
                "color" => descending
                    ? projection.OrderByDescending(x => x.Tag.Color)
                    : projection.OrderBy(x => x.Tag.Color),
                _ => projection.OrderBy(x => x.Tag.Name)
            };
        }
        else
        {
            projection = projection.OrderBy(x => x.Tag.Name);
        }

        var queryParameters = new QueryParameters
        {
            Page = filters.Page,
            PageSize = filters.PageSize
        };

        var paginatedResult = await projection.ToPaginatedResultAsync(
            queryParameters,
            x => new CreateUpdateTagResponse
            {
                Id = x.Tag.Id,
                Name = x.Tag.Name,
                Color = x.Tag.Color,
                CreatedAt = x.Tag.CreatedAt.ToDateTimeOffset(),
                LastModifiedAt = x.Tag.LastModifiedAt.ToDateTimeOffset(),
                JourneysCount = x.JourneysCount,
                BucketListItemCount = x.BucketListItemsCount
            },
            ct);

        return TypedResults.Ok(paginatedResult);
    }
}
