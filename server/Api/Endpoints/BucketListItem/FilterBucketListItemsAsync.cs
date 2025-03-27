using System.Linq.Expressions;
using Api.Data.Context;
using Api.Data.Entities;
using Api.DTOs;
using Api.DTOs.BucketListItems;
using Api.DTOs.Tags;
using Api.Enums;
using Api.Helpers;
using Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NodaTime;
using NodaTime.Text;

namespace Api.Endpoints.BucketListItem;

public static partial class BucketListItemEndpoints
{
    public static async Task<IResult> FilterBucketListItemsAsync(
        BucketListItemFilterRequest filters,
        HttpContext httpContext,
        ApplicationContext context,
        UserManager<ApplicationUser> userManager,
        IAuthenticatedUserService authenticatedUserService,
        CancellationToken ct)
    {
        var authenticatedUser = await authenticatedUserService.GetUserAsync();
        if (authenticatedUser == null)
        {
            return TypedResults.Unauthorized();
        }

        var query = context.BucketListItems
            .AsNoTracking()
            .Include(x => x.Tags)
            .Where(x => x.UserId == authenticatedUser.Id && !x.IsDeleted);

        if (!string.IsNullOrWhiteSpace(filters.SearchTerm))
        {
            query = query.Where(x => EF.Functions.ILike(x.Name, $"%{filters.SearchTerm}%") ||
                                     (x.Description != null &&
                                      EF.Functions.ILike(x.Description, $"%{filters.SearchTerm}%")));
        }

        if (filters.BucketListId is not null)
        {
            query = filters.BucketListId == Guid.Empty ? query.Where(j => j.BucketListId == null) : query.Where(j => j.BucketListId == filters.BucketListId);
        }

        if (filters.TagIds != null && filters.TagIds.Count != 0)
        {
            query = filters.TagMatchMode == CollectionMatchMode.All
                ? filters.TagIds.Aggregate(query,
                    (current, tagId) => current.Where(item => item.Tags.Any(t => t.Id == tagId)))
                : query.Where(item => item.Tags.Any(t => filters.TagIds.Contains(t.Id)));
        }

        if (filters.Types != null && filters.Types.Count != 0)
        {
            query = query.Where(item => filters.Types.Contains(item.Type));
        }

        if (!string.IsNullOrWhiteSpace(filters.StartDateFrom))
        {
            var parseResult = LocalDatePattern.Iso.Parse(filters.StartDateFrom);
            if (parseResult.Success)
            {
                var fromDate = parseResult.Value;
                query = query.Where(x => x.StartDate >= fromDate);
            }
        }

        if (!string.IsNullOrWhiteSpace(filters.StartDateTo))
        {
            var parseResult = LocalDatePattern.Iso.Parse(filters.StartDateTo);
            if (parseResult.Success)
            {
                var toDate = parseResult.Value;
                query = query.Where(x => x.StartDate <= toDate);
            }
        }

        if (!string.IsNullOrWhiteSpace(filters.EndDateFrom))
        {
            var parseResult = LocalDatePattern.Iso.Parse(filters.EndDateFrom);
            if (parseResult.Success)
            {
                var fromDate = parseResult.Value;
                query = query.Where(x => x.EndDate >= fromDate);
            }
        }

        if (!string.IsNullOrWhiteSpace(filters.EndDateTo))
        {
            var parseResult = LocalDatePattern.Iso.Parse(filters.EndDateTo);
            if (parseResult.Success)
            {
                var toDate = parseResult.Value;
                query = query.Where(x => x.EndDate <= toDate);
            }
        }

        var validSortColumns =
            new Dictionary<string, Expression<Func<Data.Entities.BucketListItem, object>>>(StringComparer
                .OrdinalIgnoreCase)
            {
                { "name", j => j.Name },
                { "createdAt", j => j.CreatedAt },
                { "startDate", j => j.StartDate ?? LocalDate.MaxIsoValue },
                { "endDate", j => j.EndDate ?? LocalDate.MaxIsoValue },
                { "type", j => j.Type },
                { "price", j => j.OriginalPrice ?? 0 }
            };
        
        if (!string.IsNullOrWhiteSpace(filters.SortBy))
        {
            var isDescending = string.Equals(filters.SortOrder, "desc", StringComparison.OrdinalIgnoreCase);
        
            if (string.Equals(filters.SortBy, "endDate", StringComparison.OrdinalIgnoreCase))
            {
                query = isDescending
                    ? query.OrderByDescending(j => j.EndDate != null).ThenByDescending(j => j.EndDate)
                    : query.OrderBy(j => j.EndDate == null).ThenBy(j => j.EndDate);
            }
            else if (string.Equals(filters.SortBy, "startDate", StringComparison.OrdinalIgnoreCase))
            {
                query = isDescending
                    ? query.OrderByDescending(j => j.StartDate != null).ThenByDescending(j => j.StartDate)
                    : query.OrderBy(j => j.StartDate == null).ThenBy(j => j.StartDate);
            }
            else if (validSortColumns.TryGetValue(filters.SortBy, out var sortExpression))
            {
                query = isDescending
                    ? query.OrderByDescending(sortExpression)
                    : query.OrderBy(sortExpression);
            }
        }
        else
        {
            query = query.OrderByDescending(j => j.CreatedAt);
        }

        var queryParameters = new QueryParameters
        {
            Page = filters.Page,
            PageSize = filters.PageSize
        };

        var paginatedResult = await query.ToPaginatedResultAsync(queryParameters,
            item => new BucketListItemResponse
            {
                Id = item.Id,
                Name = item.Name,
                Description = item.Description,
                Type = item.Type,
                BucketListId = item.BucketListId,
                StartDate = item.StartDate?.ToDateOnly(),
                StartTimeUtc = item.StartTimeUtc,
                StartTimeZoneId = item.StartTimeZoneId,
                EndDate = item.EndDate?.ToDateOnly(),
                EndTimeUtc = item.EndTimeUtc,
                EndTimeZoneId = item.EndTimeZoneId,
                OriginalPrice = item.OriginalPrice,
                OriginalCurrencyCode = item.OriginalCurrencyCode,
                CreatedAt = item.CreatedAt.ToDateTimeOffset(),
                ImageId = item.ImageId,
                Tags = item.Tags.Select(t => new TagDto
                {
                    Id = t.Id,
                    Name = t.Name,
                    Color = t.Color
                }).ToList()
            }, ct);

        return TypedResults.Ok(paginatedResult);
    }
}
