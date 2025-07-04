using Api.Data.Entities;
using Api.DTOs.Activities;
using NodaTime;

namespace Api.Services;

public interface IActivityService
{
    Task<List<JourneyActivity>> GetActivitiesByJourneyIdAsync(Guid journeyId, string sortMode, CancellationToken ct);
    Task<List<JourneyActivity>> GetActivitiesByDayNumberAsync(Guid journeyId, int dayNumber, string sortMode, CancellationToken ct);
    Task<List<JourneyActivity>> GetActivitiesByDateAsync(Guid journeyId, LocalDate date, string sortMode, CancellationToken ct);
    Task<JourneyActivity?> GetActivityByIdAsync(Guid journeyId, Guid activityId, CancellationToken ct);
    Task<JourneyActivity> CreateActivityAsync(Guid journeyId, CreateUpdateActivityRequest request, Guid userId, CancellationToken ct);
    Task<JourneyActivity?> UpdateActivityAsync(Guid journeyId, Guid activityId, CreateUpdateActivityRequest request, Guid userId, CancellationToken ct);
    Task<bool> DeleteActivityAsync(Guid journeyId, Guid activityId, CancellationToken ct);
    Task<bool> ReorderActivitiesAsync(Guid journeyId, List<ActivityOrderItem> activities, CancellationToken ct);
    Task<CalendarSummaryResponse> GetCalendarSummaryAsync(Guid journeyId, CancellationToken ct);
    ActivityBaseDto MapToDto(JourneyActivity activity);
    Task<bool> ValidateJourneyAccessAsync(Guid journeyId, Guid userId, CancellationToken ct);
}