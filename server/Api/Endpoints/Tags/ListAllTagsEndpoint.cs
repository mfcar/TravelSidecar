using Api.Data.Context;
using Api.DTOs;
using Api.DTOs.Tags;
using Api.Helpers;
using Api.Services;
using Microsoft.EntityFrameworkCore;

namespace Api.Endpoints.Tags;

public static partial class TagEndpoints
{
    public static async Task<IResult> ListAllTagsAsync(
        int? page,
        int? pageSize,
        string? searchTerm,
        string? sortBy,
        string? sortOrder,
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

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(t => EF.Functions.ILike(t.Name, $"%{searchTerm}%"));
        }

        var projection = query.Select(t => new
        {
            Tag = t,
            JourneysCount = t.Journeys.Count,
            BucketListItemsCount = t.BucketListItems.Count
        });

        var descending = string.Equals(sortOrder, "desc", StringComparison.OrdinalIgnoreCase);
        if (!string.IsNullOrWhiteSpace(sortBy))
        {
            projection = sortBy.ToLower() switch
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
                _ => projection.OrderBy(x => x.Tag.Name)
            };
        }
        else
        {
            projection = projection.OrderBy(x => x.Tag.Name);
        }

        var queryParameters = new QueryParameters
        {
            Page = page ?? 1,
            PageSize = pageSize ?? 25
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

