using NodaTime;

namespace Api.DTOs.Activities;

public class CalendarSummaryResponse
{
    public List<DayActivityCount> DaysWithActivities { get; set; } = new();
    public List<DayActivityCountIndexed> DaysWithActivitiesIndexed { get; set; } = new();
}

public class DayActivityCount
{
    public LocalDate Date { get; set; }
    public int ActivityCount { get; set; }
}

public class DayActivityCountIndexed
{
    public int DayNumber { get; set; }
    public int ActivityCount { get; set; }
}