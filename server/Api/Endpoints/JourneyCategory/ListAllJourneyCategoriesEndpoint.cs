using System.Linq.Expressions;
using Api.Data.Context;
using Api.Data.Entities;
using Api.DTOs;
using Api.Helpers;
using Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Api.Endpoints.JourneyCategory;

public static partial class JourneyCategoryEndpoints
{
    [Obsolete("This endpoint is deprecated. Please use the FilterJourneyCategories endpoint instead.")]
    public static async Task<IResult> ListAllJourneyCategoriesAsync(
        int? page,
        int? pageSize,
        string? searchTerm,
        string? sortBy,
        string? sortOrder,
        bool? includeUncategorized,
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
        
        var queryParameters = new JourneyCategoryQueryParameters
        {
            Page = page ?? 1,
            PageSize = pageSize ?? 25,
            SearchTerm = searchTerm,
            SortBy = sortBy,
            SortOrder = sortOrder
        };

        if (includeUncategorized.HasValue && includeUncategorized.Value)
        {
            var realCategoriesQuery = context.JourneyCategories
                .AsNoTracking()
                .Where(x => x.UserId == authenticatedUser.Id);

            if (!string.IsNullOrWhiteSpace(queryParameters.SearchTerm))
            {
                realCategoriesQuery = realCategoriesQuery.Where(x =>
                    EF.Functions.ILike(x.Name, $"%{queryParameters.SearchTerm}%"));
            }

            var realCategories = await realCategoriesQuery
                .Select(jc => new JourneyCategoryResponse()
                {
                    Id = jc.Id,
                    Name = jc.Name,
                    Description = jc.Description,
                    CreatedAt = jc.CreatedAt.ToDateTimeOffset(),
                    LastModifiedAt = jc.LastModifiedAt.ToDateTimeOffset(),
                    JourneysCount = context.Journeys.Count(j => j.JourneyCategoryId == jc.Id && j.UserId == authenticatedUser.Id)
                })
                .ToListAsync(ct);

            var uncategorizedCount = await context.Journeys
                .AsNoTracking()
                .CountAsync(j => j.UserId == authenticatedUser.Id && j.JourneyCategoryId == null, ct);
            
            const string virtualCategoryName = "Uncategorized";
            if (string.IsNullOrWhiteSpace(queryParameters.SearchTerm) ||
                EF.Functions.ILike(virtualCategoryName, $"%{queryParameters.SearchTerm}%"))
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
            
            realCategories = queryParameters.SortBy?.ToLowerInvariant() switch
            {
                "name" => string.Equals(queryParameters.SortOrder, "desc", StringComparison.OrdinalIgnoreCase)
                              ? realCategories.OrderByDescending(x => x.Name).ToList()
                              : realCategories.OrderBy(x => x.Name).ToList(),
                "createdat" => string.Equals(queryParameters.SortOrder, "desc", StringComparison.OrdinalIgnoreCase)
                              ? realCategories.OrderByDescending(x => x.CreatedAt).ToList()
                              : realCategories.OrderBy(x => x.CreatedAt).ToList(),
                "lastmodifiedat" => string.Equals(queryParameters.SortOrder, "desc", StringComparison.OrdinalIgnoreCase)
                              ? realCategories.OrderByDescending(x => x.LastModifiedAt).ToList()
                              : realCategories.OrderBy(x => x.LastModifiedAt).ToList(),
                "journeyscount" => string.Equals(queryParameters.SortOrder, "desc", StringComparison.OrdinalIgnoreCase)
                              ? realCategories.OrderByDescending(x => x.JourneysCount).ToList()
                              : realCategories.OrderBy(x => x.JourneysCount).ToList(),
                _ => realCategories.OrderBy(x => x.CreatedAt).ToList()
            };

            var totalCount = realCategories.Count;
            var pagedCategories = realCategories
                .Skip((queryParameters.Page - 1) * queryParameters.PageSize)
                .Take(queryParameters.PageSize)
                .ToList();

            var paginatedResult = new PaginatedResult<JourneyCategoryResponse>
            {
                Items = pagedCategories,
                TotalCount = totalCount,
                PageSize = queryParameters.PageSize,
                CurrentPage = queryParameters.Page
            };

            return TypedResults.Ok(paginatedResult);
        }

        if (string.Equals(queryParameters.SortBy, "JourneysCount", StringComparison.OrdinalIgnoreCase))
        {
            var queryWithCount = context.JourneyCategories
                .AsNoTracking()
                .Where(x => x.UserId == authenticatedUser.Id);

            if (!string.IsNullOrWhiteSpace(queryParameters.SearchTerm))
            {
                queryWithCount = queryWithCount.Where(x =>
                    EF.Functions.ILike(x.Name, $"%{queryParameters.SearchTerm}%"));
            }

            var qc = queryWithCount.Select(jc => new
            {
                Category = jc,
                JourneysCount = context.Journeys.Count(j => j.JourneyCategoryId == jc.Id && j.UserId == authenticatedUser.Id)
            });

            qc = string.Equals(queryParameters.SortOrder, "desc", StringComparison.OrdinalIgnoreCase)
                ? qc.OrderByDescending(x => x.JourneysCount)
                : qc.OrderBy(x => x.JourneysCount);

            var paginatedResult = await qc.ToPaginatedResultAsync(queryParameters,
                x => new JourneyCategoryResponse
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
            var validSortColumns = new Dictionary<string, Expression<Func<Data.Entities.JourneyCategory, object>>>(StringComparer.OrdinalIgnoreCase)
            {
                { "Name", j => j.Name },
                { "CreatedAt", j => j.CreatedAt },
                { "LastModifiedAt", j => j.LastModifiedAt }
            };

            var query = context.JourneyCategories
                .AsNoTracking()
                .Where(x => x.UserId == authenticatedUser.Id);

            if (!string.IsNullOrWhiteSpace(queryParameters.SearchTerm))
            {
                query = query.Where(x =>
                    EF.Functions.ILike(x.Name, $"%{queryParameters.SearchTerm}%"));
            }
                
            query = !string.IsNullOrWhiteSpace(queryParameters.SortBy) &&
                    validSortColumns.TryGetValue(queryParameters.SortBy, out var sortExpression)
                ? string.Equals(queryParameters.SortOrder, "desc", StringComparison.OrdinalIgnoreCase)
                    ? query.OrderByDescending(sortExpression)
                    : query.OrderBy(sortExpression)
                : query.OrderBy(j => j.CreatedAt);

            var paginatedResult = await query.ToPaginatedResultAsync(queryParameters,
                jc => new JourneyCategoryResponse
                {
                    Id = jc.Id,
                    Name = jc.Name,
                    Description = jc.Description,
                    CreatedAt = jc.CreatedAt.ToDateTimeOffset(),
                    LastModifiedAt = jc.LastModifiedAt.ToDateTimeOffset(),
                    JourneysCount = context.Journeys.Count(j => j.JourneyCategoryId == jc.Id && j.UserId == authenticatedUser.Id)
                }, ct);
            return TypedResults.Ok(paginatedResult);
        }
    }
}

public class JourneyCategoryQueryParameters : QueryParameters
{
    public string? SearchTerm { get; set; }
    public string? SortBy { get; set; }
    public string? SortOrder { get; set; }
}

public class JourneyCategoryResponse
{
    public Guid Id { get; set; }

    public required string Name { get; set; }

    public string? Description { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset? LastModifiedAt { get; set; }
    public int JourneysCount { get; set; }
}
