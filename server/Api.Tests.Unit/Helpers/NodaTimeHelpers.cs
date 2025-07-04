using NodaTime;

namespace Api.Tests.Unit.Helpers;

public static class NodaTimeHelpers
{
    public static readonly DateTimeZone DefaultTestTimeZone = DateTimeZoneProviders.Tzdb["Europe/Dublin"];
    
    public static Instant CreateInstant(int year, int month, int day, int hour = 0, int minute = 0)
    {
        var localDateTime = new LocalDateTime(year, month, day, hour, minute);
        var zonedDateTime = localDateTime.InZoneStrictly(DefaultTestTimeZone);
        return zonedDateTime.ToInstant();
    }
    
    public static LocalDate CreateLocalDate(int year, int month, int day)
    {
        return new LocalDate(year, month, day);
    }
    
    public static ZonedDateTime CreateZonedDateTime(int year, int month, int day, int hour = 0, int minute = 0, string? timeZoneId = null)
    {
        var zone = timeZoneId != null ? DateTimeZoneProviders.Tzdb[timeZoneId] : DefaultTestTimeZone;
        var localDateTime = new LocalDateTime(year, month, day, hour, minute);
        return localDateTime.InZoneStrictly(zone);
    }
    
    public static LocalTime CreateLocalTime(int hour, int minute, int second = 0)
    {
        return new LocalTime(hour, minute, second);
    }
}
