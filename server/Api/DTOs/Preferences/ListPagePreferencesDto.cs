using Api.Enums;

namespace Api.DTOs.Preferences;

public class ListPagePreferencesDto
{
    public ListViewMode ViewMode { get; set; }
    public string SortBy { get; set; } = null!;
    public string SortOrder { get; set; } = "asc";
    public string[] SelectedFields { get; set; } = [];
}
