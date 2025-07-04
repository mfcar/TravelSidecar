using Api.DTOs.Activities;
using Api.Services;

namespace Api.Endpoints.Activities;

public static partial class ActivityEndpoints
{
    public static async Task<IResult> CreateActivityAsync(
        Guid journeyId,
        CreateUpdateActivityRequest request,
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

        // Validate dates
        if (request.StartDateTime.HasValue && request.EndDateTime.HasValue)
        {
            if (request.EndDateTime.Value < request.StartDateTime.Value)
            {
                return TypedResults.BadRequest(new { Error = "End date/time must be after start date/time" });
            }
        }

        // Validate timezones if dates are provided
        if (request.StartDateTime.HasValue && string.IsNullOrEmpty(request.StartTimezone))
        {
            return TypedResults.BadRequest(new { Error = "Start timezone is required when start date/time is provided" });
        }

        if (request.EndDateTime.HasValue && string.IsNullOrEmpty(request.EndTimezone))
        {
            return TypedResults.BadRequest(new { Error = "End timezone is required when end date/time is provided" });
        }

        try
        {
            var activity = await activityService.CreateActivityAsync(journeyId, request, authenticatedUser.Id, ct);
            var dto = activityService.MapToDto(activity);
            
            return TypedResults.Created($"/api/journeys/{journeyId}/activities/{activity.Id}", dto);
        }
        catch (Exception ex)
        {
            return TypedResults.Problem(
                title: "Failed to create activity",
                detail: ex.Message,
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }
}