using Api.Enums;

namespace Api.DTOs.Preferences;

public class BasicUserPreferencesDto
{
    public UserDateFormat? PreferredDateFormat { get; set; }
    public UserTimeFormat? PreferredTimeFormat { get; set; }
    public FirstDayOfWeek? PreferredFirstDayOfWeek { get; set; }
    public string? PreferredTimezone { get; set; }
    public string? PreferredCurrencyCode { get; set; }
    public UserThemeMode? PreferredThemeMode { get; set; }
    public int? PreferredItemsPerPage { get; set; }
    public string? PreferredLanguage { get; set; }
}
