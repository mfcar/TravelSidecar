namespace Api.DTOs.Files;

public class FileQueryParameters : QueryParameters
{
    public string? SearchTerm { get; set; }
    public string? SortBy { get; set; }
    public string? SortOrder { get; set; }
}
