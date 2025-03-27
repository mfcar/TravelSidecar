using System.ComponentModel.DataAnnotations;

namespace Api.DTOs.JourneyCategories;

public class JourneyCategoryFilterRequest
{
    [Range(1, int.MaxValue)]
    public int Page { get; set; } = 1;

    [Range(1, 100)]
    public int PageSize { get; set; } = 25;
    
    public string? SearchTerm { get; set; }
    
    public string? SortBy { get; set; }
    public string? SortOrder { get; set; }
    
    public bool? IncludeUncategorized { get; set; }
    
    public bool? HasJourneys { get; set; }
}
