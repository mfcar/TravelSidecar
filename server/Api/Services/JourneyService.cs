using Api.Enums;
using NodaTime;

namespace Api.Services;

public interface IJourneyService
{
    int? CalculateDaysUntilStartJourney(LocalDate? startDate);
    int? CalculateJourneyDurationInDays(LocalDate? startDate, LocalDate? endDate);
    JourneyStatus CalculateStatus(LocalDate? startDate, LocalDate? endDate);
    (LocalDate? StartDate, LocalDate? EndDate, string? Error) ValidateAndParseDates(int startYear, int startMonth, int startDay, int endYear, int endMonth, int endDay);
}

public class JourneyService : IJourneyService
{
    private readonly IClock _clock;

    public JourneyService(IClock clock)
    {
        _clock = clock;
    }

    public int? CalculateDaysUntilStartJourney(LocalDate? startDate)
    {
        if (!startDate.HasValue)
        {
            return null;
        }

        var today = _clock.GetCurrentInstant().InUtc().Date;
        return Period.Between(today, startDate.Value, PeriodUnits.Days).Days;
    }
    
    public int? CalculateJourneyDurationInDays(LocalDate? startDate, LocalDate? endDate)
    {
        if (startDate.HasValue && endDate.HasValue)
        {
            return Period.Between(startDate.Value, endDate.Value, PeriodUnits.Days).Days;
        }
        return null;
    }
    
    public JourneyStatus CalculateStatus(LocalDate? startDate, LocalDate? endDate)
    {
        var today = _clock.GetCurrentInstant().InUtc().Date;
        var status = JourneyStatus.Unknown;

        if (startDate.HasValue && endDate.HasValue)
        {
            if (today < startDate.Value)
            {
                status = JourneyStatus.Upcoming;
            }
            else if (today >= startDate.Value && today <= endDate.Value)
            {
                status = JourneyStatus.InProgress;
            }
            else if (today > endDate.Value)
            {
                status = JourneyStatus.Completed;
            }
        }
        else if (startDate.HasValue)
        {
            status = today < startDate.Value ? JourneyStatus.Upcoming : JourneyStatus.InProgress;
        }

        return status;
    }

    public (LocalDate? StartDate, LocalDate? EndDate, string? Error) ValidateAndParseDates(
        int startYear, int startMonth, int startDay, 
        int endYear, int endMonth, int endDay)
    {
        LocalDate? startDate = null;
        LocalDate? endDate = null;

        if (startYear != 0 && startMonth != 0 && startDay != 0)
        {
            startDate = new LocalDate(startYear, startMonth, startDay);
        }

        if (endYear != 0 && endMonth != 0 && endDay != 0)
        {
            endDate = new LocalDate(endYear, endMonth, endDay);
        }

        if (endDate.HasValue && startDate.HasValue)
        {
            if (endDate < startDate)
            {
                return (null, null, "End date cannot be before the Start date.");
            }
        }

        return (startDate, endDate, null);
    }
}
