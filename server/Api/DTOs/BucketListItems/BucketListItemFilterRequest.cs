using System.ComponentModel.DataAnnotations;
using Api.Enums;

namespace Api.DTOs.BucketListItems;

public class BucketListItemFilterRequest
{
    [Range(1, int.MaxValue)]
    public int Page { get; set; } = 1;
    
    [Range(1, 100)]
    public int PageSize { get; set; } = 25;
    
    public string? SearchTerm { get; set; }
    
    public string? SortBy { get; set; }
    public string? SortOrder { get; set; }
    
    public Guid? BucketListId { get; set; }
    
    public List<Guid>? TagIds { get; set; }
    public CollectionMatchMode TagMatchMode { get; set; } = CollectionMatchMode.Any;
    
    public List<BucketListItemType>? Types { get; set; }
    
    public string? StartDateFrom { get; set; }
    public string? StartDateTo { get; set; }
    
    public string? EndDateFrom { get; set; }
    public string? EndDateTo { get; set; }
}
