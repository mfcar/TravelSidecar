using Api.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Api.Helpers;

public static class PaginationExtensions
{
    public static async Task<PaginatedResult<TResult>> ToPaginatedResultAsync<TSource, TResult>(
        this IQueryable<TSource> query,
        QueryParameters queryParams,
        Func<TSource, TResult> selector,
        CancellationToken ct,
        Func<TSource, bool>? filter = null)
    {
        if (filter != null)
        {
            query = query.Where(filter).AsQueryable();
        }
        
        var totalCount = await query.CountAsync(ct);

        var items = await query
            .Skip((queryParams.Page - 1) * queryParams.PageSize)
            .Take(queryParams.PageSize)
            .ToListAsync(ct);

        var projectedItems = items.Select(selector).ToList();

        return new PaginatedResult<TResult>
        {
            Items = projectedItems,
            TotalCount = totalCount,
            PageSize = queryParams.PageSize,
            CurrentPage = queryParams.Page
        };
    }
}