using Api.Services;
using NodaTime;

namespace Api.Endpoints.Activities;

public static partial class ActivityEndpoints
{
    public static async Task<IResult> GetActivitiesByDateAsync(
        Guid journeyId,
        DateOnly date,
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

        var localDate = new LocalDate(date.Year, date.Month, date.Day);
        var activities = await activityService.GetActivitiesByDateAsync(journeyId, localDate, sortMode, ct);
        var dtos = activities.Select(activityService.MapToDto).ToList();

        return TypedResults.Ok(dtos);
    }
}