using System.Linq.Expressions;
using Api.Data.Context;
using Api.DTOs;
using Api.Helpers;
using Microsoft.EntityFrameworkCore;

namespace Api.Endpoints.User;

public static partial class UserEndpoints
{
    public static async Task<IResult> ListAllUsersAsync(
        int? page,
        int? pageSize,
        string? searchTerm,
        string? sortBy,
        string? sortOrder,
        ApplicationContext context,
        CancellationToken ct)
    {
        var queryParameters = new UserQueryParameters
        {
            Page = page ?? 1,
            PageSize = pageSize ?? 25,
            SearchTerm = searchTerm,
            SortBy = sortBy,
            SortOrder = sortOrder
        };
        
        var query = context.Users.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(queryParameters.SearchTerm))
        {
            query = query.Where(x =>
                EF.Functions.ILike(x.UserName, $"%{queryParameters.SearchTerm}%") ||
                EF.Functions.ILike(x.Email, $"%{queryParameters.SearchTerm}%"));
        }
        
        var validSortColumns = new Dictionary<string, Expression<Func<Data.Entities.ApplicationUser, object>>>(StringComparer.OrdinalIgnoreCase)
        {
            { "Username", j => j.UserName },
            { "Email", j => j.Email },
            { "CreatedAt", j => j.CreatedAt },
            { "LastModifiedAt", j => j.LastModifiedAt },
            { "LastActiveAt", j => j.LastActiveAt }
        };

        if (!string.IsNullOrWhiteSpace(queryParameters.SortBy) &&
            validSortColumns.TryGetValue(queryParameters.SortBy, out var sortExpression))
        {
            var descending = string.Equals(queryParameters.SortOrder, "desc", StringComparison.OrdinalIgnoreCase);
            query = descending ? query.OrderByDescending(sortExpression) : query.OrderBy(sortExpression);
        }
        else
        {
            query = query.OrderBy(j => j.CreatedAt);
        }

        var paginatedResult = await query.ToPaginatedResultAsync(
            queryParameters,
            u => new UserResponse
            {
                Id = u.Id,
                Email = u.Email!,
                Username = u.UserName!,
                CreatedAt = u.CreatedAt.ToDateTimeOffset(),
                LastModifiedAt = u.LastModifiedAt.ToDateTimeOffset(),
                LastActiveAt = u.LastActiveAt?.ToDateTimeOffset()
            },
            ct);

        return TypedResults.Ok(paginatedResult);
    }
}

public class UserQueryParameters : QueryParameters
{
    public string? SearchTerm { get; set; }
    public string? SortBy { get; set; }
    public string? SortOrder { get; set; }
}

public class UserResponse
{
    public Guid Id { get; set; }
    public required string Email { get; set; }
    public required string Username { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset LastModifiedAt { get; set; }
    public DateTimeOffset? LastActiveAt { get; set; }
}
