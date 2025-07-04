using Api.Services;

namespace Api.Endpoints.Activities;

public static partial class ActivityEndpoints
{
    public static async Task<IResult> GetActivitiesByDayAsync(
        Guid journeyId,
        int dayNumber,
        string sortMode,
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

        var activities = await activityService.GetActivitiesByDayNumberAsync(journeyId, dayNumber, sortMode, ct);
        var dtos = activities.Select(activityService.MapToDto).ToList();

        return TypedResults.Ok(dtos);
    }
}