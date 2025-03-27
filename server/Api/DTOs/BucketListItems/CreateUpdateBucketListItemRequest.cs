using System.ComponentModel.DataAnnotations;
using Api.Enums;
using NodaTime;

namespace Api.DTOs.BucketListItems;

public class CreateUpdateBucketListItemRequest
{
    [Required]
    [MaxLength(200)]
    public required string Name { get; set; }
    
    [Required]
    public BucketListItemType Type { get; set; }
    
    [MaxLength(500)]
    public string? Description { get; set; }
    
    public Guid? BucketListId { get; set; }
    
    public LocalDate? StartDate { get; set; }
    public string? StartTime { get; set; }
    public string? StartTimeZoneId { get; set; }
    
    public LocalDate? EndDate { get; set; }
    public string? EndTime { get; set; }
    public string? EndTimeZoneId { get; set; }
    
    public decimal? OriginalPrice { get; set; }
    public string? OriginalCurrencyCode { get; set; }
    
    public List<Guid>? TagIds { get; set; }
}
