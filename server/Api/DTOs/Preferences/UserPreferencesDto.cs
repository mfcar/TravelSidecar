using Api.Enums;

namespace Api.DTOs.Preferences;

public class UserPreferencesDto
{
    public UserDateFormat PreferredDateFormat { get; set; }
    public UserTimeFormat PreferredTimeFormat { get; set; }
    public string PreferredTimezone { get; set; }
    public string PreferredCurrencyCode { get; set; }
    public UserThemeMode PreferredThemeMode { get; set; }
    public int PreferredItemsPerPage { get; set; }
    public string PreferredLanguage { get; set; }
    
    public Dictionary<string, ListPagePreferencesDto> PagePreferences { get; set; } = new();
    
    public bool IsInitialSetupComplete { get; set; }
}
