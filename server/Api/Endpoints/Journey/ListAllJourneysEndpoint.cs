using System.Linq.Expressions;
using Api.Data.Context;
using Api.Data.Entities;
using Api.DTOs;
using Api.DTOs.Journeys;
using Api.Helpers;
using Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Api.Endpoints.Journey;

public static partial class JourneyEndpoints
{
    public static async Task<IResult> ListAllJourneysAsync(
        int? page,
        int? pageSize,
        string? searchTerm,
        Guid? categoryId,
        string? sortBy,
        string? sortOrder,
        HttpContext httpContext, ApplicationContext context,
        UserManager<ApplicationUser> userManager,
        IAuthenticatedUserService authenticatedUserService,
        IJourneyService journeyService,
        CancellationToken ct)
    {
        var authenticatedUser = await authenticatedUserService.GetUserAsync();
        if (authenticatedUser == null)
        {
            return TypedResults.Unauthorized();
        }

        var queryParameters = new JourneyQueryParameters
        {
            Page = page ?? 1,
            PageSize = pageSize ?? 25,
            SearchTerm = searchTerm,
            CategoryId = categoryId,
            SortBy = sortBy,
            SortOrder = sortOrder
        };

        var query = context.Journeys
            .AsNoTracking()
            .Include(j => j.JourneyCategory)
            .Where(j => j.UserId == authenticatedUser.Id);

        if (!string.IsNullOrWhiteSpace(queryParameters.SearchTerm))
        {
            query = query.Where(j => EF.Functions.ILike(j.Name, $"%{queryParameters.SearchTerm}%"));
        }
        
        if (queryParameters.CategoryId is not null)
        {
            query = queryParameters.CategoryId == Guid.Empty ? query.Where(j => j.JourneyCategoryId == null) : query.Where(j => j.JourneyCategoryId == queryParameters.CategoryId);
        }
        
        var validSortColumns = new Dictionary<string, Expression<Func<Data.Entities.Journey, object>>>(StringComparer.OrdinalIgnoreCase)
        {
            { "Name", j => j.Name },
            { "StartDate", j => j.StartDate },
            { "CreatedAt", j => j.CreatedAt },
            { "LastModifiedAt", j => j.LastModifiedAt }
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

        var paginatedResult = await query
            .ToPaginatedResultAsync(queryParameters, j => new JourneyResponse
            {
                Id = j.Id,
                Name = j.Name,
                Description = j.Description,
                StartDate = j.StartDate?.ToDateOnly(),
                EndDate = j.EndDate?.ToDateOnly(),
                CreatedAt = j.CreatedAt.ToDateTimeOffset(),
                LastModifiedAt = j.LastModifiedAt.ToDateTimeOffset(),
                CategoryId = j.JourneyCategoryId,
                CategoryName = j.JourneyCategory != null ? j.JourneyCategory.Name : string.Empty,
                DaysUntilStart = journeyService.CalculateDaysUntilStartJourney(j.StartDate),
                JourneyDurationInDays = journeyService.CalculateJourneyDurationInDays(j.StartDate, j.EndDate),
                Status = journeyService.CalculateStatus(j.StartDate, j.EndDate)
            }, ct);

        return TypedResults.Ok(paginatedResult);
    }
}

public class JourneyQueryParameters : QueryParameters
{
    public string? SearchTerm { get; set; }
    public Guid? CategoryId { get; set; }
    public string? SortBy { get; set; }
    public string? SortOrder { get; set; }
}
