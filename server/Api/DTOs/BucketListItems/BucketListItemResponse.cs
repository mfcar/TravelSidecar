using Api.DTOs.Tags;
using Api.Enums;
using NodaTime;

namespace Api.DTOs.BucketListItems;

public class BucketListItemResponse
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public BucketListItemType Type { get; set; }
    
    public Guid? BucketListId { get; set; }
    
    public DateOnly? StartDate { get; set; }
    public Instant? StartTimeUtc { get; set; }
    public string? StartTimeZoneId { get; set; }
    
    public DateOnly? EndDate { get; set; }
    public Instant? EndTimeUtc { get; set; }
    public string? EndTimeZoneId { get; set; }
    
    public decimal? OriginalPrice { get; set; }
    public string? OriginalCurrencyCode { get; set; }
    
    public Guid? ImageId { get; set; }
    
    public List<TagDto>? Tags { get; set; }
    
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
}
