using Api.DTOs.Activities;
using Api.Services;

namespace Api.Endpoints.Activities;

public static partial class ActivityEndpoints
{
    public static async Task<IResult> ReorderActivitiesAsync(
        Guid journeyId,
        ReorderActivitiesRequest request,
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

        var success = await activityService.ReorderActivitiesAsync(journeyId, request.Activities, ct);
        if (!success)
        {
            return TypedResults.BadRequest(new { Error = "Failed to reorder activities. Ensure all activity IDs are valid." });
        }

        return TypedResults.NoContent();
    }
}