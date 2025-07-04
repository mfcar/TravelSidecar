using Api.DTOs.Activities;
using Api.Services;

namespace Api.Endpoints.Activities;

public static partial class ActivityEndpoints
{
    public static async Task<IResult> GetActivitiesAsync(
        Guid journeyId,
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

        var activities = await activityService.GetActivitiesByJourneyIdAsync(journeyId, sortMode, ct);
        var dtos = activities.Select(activityService.MapToDto).ToList();

        return TypedResults.Ok(dtos);
    }
}