using Api.Services;

namespace Api.Endpoints.Activities;

public static partial class ActivityEndpoints
{
    public static async Task<IResult> GetCalendarSummaryAsync(
        Guid journeyId,
        IActivityService activityService,
        IAuthenticatedUserService authenticatedUserService,
        CancellationToken ct)
    {
        var authenticatedUser = await authenticatedUserService.GetUserAsync();
        if (authenticatedUser == null)
        {
            return TypedResults.Unauthorized();
        }

        if (!await activityService.ValidateJourneyAccessAsync(journeyId, authenticatedUser.Id, ct))
        {
            return TypedResults.NotFound();
        }

        var summary = await activityService.GetCalendarSummaryAsync(journeyId, ct);
        return TypedResults.Ok(summary);
    }
}