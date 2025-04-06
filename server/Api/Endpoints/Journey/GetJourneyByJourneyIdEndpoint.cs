using Api.Data.Context;
using Api.Data.Entities;
using Api.DTOs.Journeys;
using Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Api.Endpoints.Journey;

public static partial class JourneyEndpoints
{
    public static async Task<IResult> GetJourneyByJourneyIdAsync(
        Guid journeyId,
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

        var journey = await context.Journeys
            .AsNoTracking()
            .Include(j => j.JourneyCategory)
            .Where(j => j.UserId == authenticatedUser.Id && j.Id == journeyId)
            .FirstOrDefaultAsync(ct);

        if (journey == null)
        {
            return TypedResults.NotFound(new { Error = "Journey not found." });
        }

        return TypedResults.Ok(new JourneyResponse
        {
            Id = journey.Id,
            Name = journey.Name,
            Description = journey.Description,
            StartDate = journey.StartDate?.ToDateOnly(),
            EndDate = journey.EndDate?.ToDateOnly(),
            CreatedAt = journey.CreatedAt.ToDateTimeOffset(),
            LastModifiedAt = journey.LastModifiedAt.ToDateTimeOffset(),
            CoverImageId = journey.CoverImageId,
            CategoryId = journey.JourneyCategoryId,
            CategoryName = journey.JourneyCategory?.Name ?? string.Empty,
            DaysUntilStart = journeyService.CalculateDaysUntilStartJourney(journey.StartDate),
            JourneyDurationInDays = journeyService.CalculateJourneyDurationInDays(journey.StartDate, journey.EndDate),
            Status = journeyService.CalculateStatus(journey.StartDate, journey.EndDate)
        });
    }
}
