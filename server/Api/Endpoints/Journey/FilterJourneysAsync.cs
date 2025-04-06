using System.Linq.Expressions;
using Api.Data.Context;
using Api.Data.Entities;
using Api.DTOs;
using Api.DTOs.Journeys;
using Api.DTOs.Tags;
using Api.Enums;
using Api.Helpers;
using Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NodaTime;
using NodaTime.Text;

namespace Api.Endpoints.Journey;

public static partial class JourneyEndpoints
{
    public static async Task<IResult> FilterJourneysAsync(
        JourneyFilterRequest filters,
        HttpContext httpContext,
        ApplicationContext context,
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

        var query = context.Journeys
            .AsNoTracking()
            .Include(j => j.JourneyCategory)
            .Include(j => j.Tags)
            .Where(j => j.UserId == authenticatedUser.Id);

        // Apply filters
        if (!string.IsNullOrWhiteSpace(filters.SearchTerm))
        {
            query = query.Where(j => EF.Functions.ILike(j.Name, $"%{filters.SearchTerm}%") ||
                                     (j.Description != null &&
                                      EF.Functions.ILike(j.Description, $"%{filters.SearchTerm}%")));
        }

        if (filters.CategoryId is not null)
        {
            query = filters.CategoryId == Guid.Empty
                ? query.Where(j => j.JourneyCategoryId == null)
                : query.Where(j => j.JourneyCategoryId == filters.CategoryId);
        }

        // Tag filtering
        if (filters.TagIds != null && filters.TagIds.Count > 0)
        {
            query = filters.TagMatchMode == CollectionMatchMode.All
                ? filters.TagIds.Aggregate(query,
                    (current, tagId) => current.Where(item => item.Tags.Any(t => t.Id == tagId)))
                : query.Where(item => item.Tags.Any(t => filters.TagIds.Contains(t.Id)));
        }

        // Date range filtering
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

        // Handle sorting
        var validSortColumns =
            new Dictionary<string, Expression<Func<Data.Entities.Journey, object>>>(StringComparer.OrdinalIgnoreCase)
            {
                { "name", j => j.Name },
                { "startDate", j => j.StartDate ?? LocalDate.MaxIsoValue },
                { "endDate", j => j.EndDate ?? LocalDate.MaxIsoValue },
                { "createdAt", j => j.CreatedAt },
                { "lastModifiedAt", j => j.LastModifiedAt }
            };

        if (!string.IsNullOrWhiteSpace(filters.SortBy) &&
            validSortColumns.TryGetValue(filters.SortBy, out var sortExpression))
        {
            var descending = string.Equals(filters.SortOrder, "desc", StringComparison.OrdinalIgnoreCase);
            query = descending ? query.OrderByDescending(sortExpression) : query.OrderBy(sortExpression);
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
                CoverImageId = j.CoverImageId,
                CategoryId = j.JourneyCategoryId,
                CategoryName = j.JourneyCategory?.Name ?? string.Empty,
                DaysUntilStart = journeyService.CalculateDaysUntilStartJourney(j.StartDate),
                JourneyDurationInDays = journeyService.CalculateJourneyDurationInDays(j.StartDate, j.EndDate),
                Status = journeyService.CalculateStatus(j.StartDate, j.EndDate),
                Tags = j.Tags.Select(t => new TagDto
                {
                    Id = t.Id,
                    Name = t.Name,
                    Color = t.Color
                }).ToList()
            }, ct);

        return TypedResults.Ok(paginatedResult);
    }
}
