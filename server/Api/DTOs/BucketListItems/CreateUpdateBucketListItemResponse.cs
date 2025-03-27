using Api.DTOs.Tags;
using Api.Enums;
using NodaTime;

namespace Api.DTOs.BucketListItems;

public class CreateUpdateBucketListItemResponse
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public BucketListItemType Type { get; set; }

    public Guid? BucketListId { get; set; }

    public LocalDate? StartDate { get; set; }
    public Instant? StartTimeUtc { get; set; }
    public string? StartTimeZoneId { get; set; }

    public LocalDate? EndDate { get; set; }
    public Instant? EndTimeUtc { get; set; }
    public string? EndTimeZoneId { get; set; }

    public decimal? OriginalPrice { get; set; }
    public string? OriginalCurrencyCode { get; set; }

    public List<TagDto>? Tags { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
}


