using System.Linq.Expressions;
using Api.Data.Context;
using Api.Data.Entities;
using Api.DTOs;
using Api.DTOs.Users;
using Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Api.Endpoints.User;

public static partial class UserEndpoints
{
    public static async Task<IResult> FilterUsersAsync(
        UserFilterRequest filters,
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

        // var isAdmin = await userManager.IsInRoleAsync(authenticatedUser, "Admin");
        // if (!isAdmin)
        // {
        //     return TypedResults.Forbid();
        // }

        var query = userManager.Users.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(filters.SearchTerm))
        {
            query = query.Where(u => 
                EF.Functions.ILike(u.UserName, $"%{filters.SearchTerm}%") ||
                EF.Functions.ILike(u.Email, $"%{filters.SearchTerm}%"));
        }

        var validSortColumns = new Dictionary<string, Expression<Func<ApplicationUser, object>>>(StringComparer.OrdinalIgnoreCase)
        {
            { "userName", u => u.UserName },
            { "email", u => u.Email },
            { "createdAt", u => u.CreatedAt },
            { "lastLogin", u => u.LastActiveAt }
        };

        if (!string.IsNullOrWhiteSpace(filters.SortBy) &&
            validSortColumns.TryGetValue(filters.SortBy, out var sortExpression))
        {
            var descending = string.Equals(filters.SortOrder, "desc", StringComparison.OrdinalIgnoreCase);
            query = descending ? query.OrderByDescending(sortExpression) : query.OrderBy(sortExpression);
        }
        else
        {
            query = query.OrderByDescending(u => u.CreatedAt);
        }

        var totalCount = await query.CountAsync(ct);
        var users = await query
            .Skip((filters.Page - 1) * filters.PageSize)
            .Take(filters.PageSize)
            .ToListAsync(ct);

        var userResponses = new List<UserResponse>();
        foreach (var user in users)
        {
            var roles = await userManager.GetRolesAsync(user);
            userResponses.Add(new UserResponse
            {
                Id = user.Id,
                Username = user.UserName,
                Email = user.Email,
                CreatedAt = user.CreatedAt.ToDateTimeOffset(),
                LastModifiedAt = user.LastModifiedAt.ToDateTimeOffset(),
                LastActiveAt = user.LastActiveAt?.ToDateTimeOffset()
            });
        }

        var paginatedResult = new PaginatedResult<UserResponse>
        {
            Items = userResponses,
            TotalCount = totalCount,
            PageSize = filters.PageSize,
            CurrentPage = filters.Page
        };

        return TypedResults.Ok(paginatedResult);
    }
}
