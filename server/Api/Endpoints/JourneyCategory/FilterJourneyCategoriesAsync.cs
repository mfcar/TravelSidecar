using System.Linq.Expressions;
using Api.Data.Context;
using Api.Data.Entities;
using Api.DTOs;
using Api.DTOs.JourneyCategories;
using Api.Helpers;
using Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Api.Endpoints.JourneyCategory;

public static partial class JourneyCategoryEndpoints
{
    public static async Task<IResult> FilterJourneyCategoriesAsync(
        JourneyCategoryFilterRequest filters,
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

        if (filters.IncludeUncategorized == true)
        {
            var realCategoriesQuery = context.JourneyCategories
                .AsNoTracking()
                .Where(x => x.UserId == authenticatedUser.Id);

            if (!string.IsNullOrWhiteSpace(filters.SearchTerm))
            {
                realCategoriesQuery = realCategoriesQuery.Where(x =>
                    EF.Functions.ILike(x.Name, $"%{filters.SearchTerm}%"));
            }

            var categoriesWithCounts = realCategoriesQuery.Select(jc => new
            {
                Category = jc,
                JourneysCount =
                    context.Journeys.Count(j => j.JourneyCategoryId == jc.Id && j.UserId == authenticatedUser.Id)
            });

            if (filters.HasJourneys.HasValue)
            {
                categoriesWithCounts = filters.HasJourneys.Value
                    ? categoriesWithCounts.Where(x => x.JourneysCount > 0)
                    : categoriesWithCounts.Where(x => x.JourneysCount == 0);
            }

            var realCategories = await categoriesWithCounts
                .Select(x => new JourneyCategoryResponse
                {
                    Id = x.Category.Id,
                    Name = x.Category.Name,
                    Description = x.Category.Description,
                    CreatedAt = x.Category.CreatedAt.ToDateTimeOffset(),
                    LastModifiedAt = x.Category.LastModifiedAt.ToDateTimeOffset(),
                    JourneysCount = x.JourneysCount
                })
                .ToListAsync(ct);

            var uncategorizedCount = await context.Journeys
                .AsNoTracking()
                .CountAsync(j => j.UserId == authenticatedUser.Id && j.JourneyCategoryId == null, ct);

            var includeUncategorized = true;
            if (filters.HasJourneys.HasValue)
            {
                includeUncategorized = filters.HasJourneys.Value ? uncategorizedCount > 0 : uncategorizedCount == 0;
            }

            const string virtualCategoryName = "Uncategorized";
            if (includeUncategorized && (string.IsNullOrWhiteSpace(filters.SearchTerm) ||
                                         EF.Functions.ILike(virtualCategoryName, $"%{filters.SearchTerm}%")))
            {
                realCategories.Add(new JourneyCategoryResponse
                {
                    Id = Guid.Empty,
                    Name = virtualCategoryName,
                    Description = null,
                    CreatedAt = DateTimeOffset.MinValue,
                    LastModifiedAt = DateTimeOffset.MinValue,
                    JourneysCount = uncategorizedCount
                });
            }

            realCategories = filters.SortBy?.ToLowerInvariant() switch
            {
                "name" => string.Equals(filters.SortOrder, "desc", StringComparison.OrdinalIgnoreCase)
                    ? realCategories.OrderByDescending(x => x.Name).ToList()
                    : realCategories.OrderBy(x => x.Name).ToList(),
                "createdat" => string.Equals(filters.SortOrder, "desc", StringComparison.OrdinalIgnoreCase)
                    ? realCategories.OrderByDescending(x => x.CreatedAt).ToList()
                    : realCategories.OrderBy(x => x.CreatedAt).ToList(),
                "lastmodifiedat" => string.Equals(filters.SortOrder, "desc", StringComparison.OrdinalIgnoreCase)
                    ? realCategories.OrderByDescending(x => x.LastModifiedAt).ToList()
                    : realCategories.OrderBy(x => x.LastModifiedAt).ToList(),
                "journeyscount" => string.Equals(filters.SortOrder, "desc", StringComparison.OrdinalIgnoreCase)
                    ? realCategories.OrderByDescending(x => x.JourneysCount).ToList()
                    : realCategories.OrderBy(x => x.JourneysCount).ToList(),
                _ => realCategories.OrderBy(x => x.CreatedAt).ToList()
            };

            var totalCount = realCategories.Count;
            var pagedCategories = realCategories
                .Skip((filters.Page - 1) * filters.PageSize)
                .Take(filters.PageSize)
                .ToList();

            var paginatedResult = new PaginatedResult<JourneyCategoryResponse>
            {
                Items = pagedCategories,
                TotalCount = totalCount,
                PageSize = filters.PageSize,
                CurrentPage = filters.Page
            };

            return TypedResults.Ok(paginatedResult);
        }
        else
        {
            if (string.Equals(filters.SortBy, "JourneysCount", StringComparison.OrdinalIgnoreCase))
            {
                var queryWithCount = context.JourneyCategories
                    .AsNoTracking()
                    .Where(x => x.UserId == authenticatedUser.Id);

                if (!string.IsNullOrWhiteSpace(filters.SearchTerm))
                {
                    queryWithCount = queryWithCount.Where(x =>
                        EF.Functions.ILike(x.Name, $"%{filters.SearchTerm}%"));
                }

                var qc = queryWithCount.Select(jc => new
                {
                    Category = jc,
                    JourneysCount = context.Journeys.Count(j =>
                        j.JourneyCategoryId == jc.Id && j.UserId == authenticatedUser.Id)
                });

                if (filters.HasJourneys.HasValue)
                {
                    qc = filters.HasJourneys.Value
                        ? qc.Where(x => x.JourneysCount > 0)
                        : qc.Where(x => x.JourneysCount == 0);
                }

                qc = string.Equals(filters.SortOrder, "desc", StringComparison.OrdinalIgnoreCase)
                    ? qc.OrderByDescending(x => x.JourneysCount)
                    : qc.OrderBy(x => x.JourneysCount);

                var queryParameters = new QueryParameters
                {
                    Page = filters.Page,
                    PageSize = filters.PageSize
                };

                var paginatedResult = await qc.ToPaginatedResultAsync(queryParameters,
                    x => new JourneyCategoryResponse()
                    {
                        Id = x.Category.Id,
                        Name = x.Category.Name,
                        Description = x.Category.Description,
                        CreatedAt = x.Category.CreatedAt.ToDateTimeOffset(),
                        LastModifiedAt = x.Category.LastModifiedAt.ToDateTimeOffset(),
                        JourneysCount = x.JourneysCount
                    }, ct);
                return TypedResults.Ok(paginatedResult);
            }
            else
            {
                var validSortColumns =
                    new Dictionary<string, Expression<Func<Data.Entities.JourneyCategory, object>>>(StringComparer
                        .OrdinalIgnoreCase)
                    {
                        { "Name", j => j.Name },
                        { "CreatedAt", j => j.CreatedAt },
                        { "LastModifiedAt", j => j.LastModifiedAt }
                    };

                var query = context.JourneyCategories
                    .AsNoTracking()
                    .Where(x => x.UserId == authenticatedUser.Id);

                if (!string.IsNullOrWhiteSpace(filters.SearchTerm))
                {
                    query = query.Where(x =>
                        EF.Functions.ILike(x.Name, $"%{filters.SearchTerm}%"));
                }

                if (filters.HasJourneys.HasValue)
                {
                    var queryWithCounts = query.Select(jc => new
                    {
                        Category = jc,
                        JourneysCount = context.Journeys.Count(j =>
                            j.JourneyCategoryId == jc.Id && j.UserId == authenticatedUser.Id)
                    });

                    queryWithCounts = filters.HasJourneys.Value
                        ? queryWithCounts.Where(x => x.JourneysCount > 0)
                        : queryWithCounts.Where(x => x.JourneysCount == 0);

                    var filteredCategoryIds = queryWithCounts.Select(x => x.Category.Id);
                    query = query.Where(x => filteredCategoryIds.Contains(x.Id));
                }

                query = !string.IsNullOrWhiteSpace(filters.SortBy) &&
                        validSortColumns.TryGetValue(filters.SortBy, out var sortExpression)
                    ? string.Equals(filters.SortOrder, "desc", StringComparison.OrdinalIgnoreCase)
                        ? query.OrderByDescending(sortExpression)
                        : query.OrderBy(sortExpression)
                    : query.OrderBy(j => j.CreatedAt);

                var queryParameters = new QueryParameters
                {
                    Page = filters.Page,
                    PageSize = filters.PageSize
                };

                var paginatedResult = await query.ToPaginatedResultAsync(queryParameters,
                    jc => new JourneyCategoryResponse()
                    {
                        Id = jc.Id,
                        Name = jc.Name,
                        Description = jc.Description,
                        CreatedAt = jc.CreatedAt.ToDateTimeOffset(),
                        LastModifiedAt = jc.LastModifiedAt.ToDateTimeOffset(),
                        JourneysCount = context.Journeys.Count(j =>
                            j.JourneyCategoryId == jc.Id && j.UserId == authenticatedUser.Id)
                    }, ct);
                return TypedResults.Ok(paginatedResult);
            }
        }
    }
}
