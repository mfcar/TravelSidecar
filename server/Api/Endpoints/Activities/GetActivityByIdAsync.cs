using Api.Services;

namespace Api.Endpoints.Activities;

public static partial class ActivityEndpoints
{
    public static async Task<IResult> GetActivityByIdAsync(
        Guid journeyId,
        Guid activityId,
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

        var activity = await activityService.GetActivityByIdAsync(journeyId, activityId, ct);
        if (activity == null)
        {
            return TypedResults.NotFound();
        }

        var dto = activityService.MapToDto(activity);
        return TypedResults.Ok(dto);
    }
}