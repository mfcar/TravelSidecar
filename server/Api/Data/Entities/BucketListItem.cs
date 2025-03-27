using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Api.Enums;
using NodaTime;

namespace Api.Data.Entities;

public class BucketListItem
{
    // Primary key
    public Guid Id { get; set; }
    
    // Foreign keys
    public Guid UserId { get; set; }
    public Guid? BucketListId { get; set; }
    public Guid? ImageId { get; set; }
    
    // Required properties
    [Required] 
    [MaxLength(200)] 
    public string Name { get; set; }
    
    // Basic properties
    [MaxLength(500)] 
    public string? Description { get; set; }
    public BucketListItemType Type { get; set; }
    
    // Date/time properties
    public LocalDate? StartDate { get; set; }
    public Instant? StartTimeUtc { get; set; }
    [MaxLength(50)] 
    public string? StartTimeZoneId { get; set; }
    public LocalDate? EndDate { get; set; }
    public Instant? EndTimeUtc { get; set; }
    [MaxLength(50)] 
    public string? EndTimeZoneId { get; set; }
    
    // Currency/price properties
    [Column(TypeName = "decimal(18,3)")] 
    public decimal? OriginalPrice { get; set; }
    [MaxLength(3)] 
    public string OriginalCurrencyCode { get; set; }
    
    // Tracking properties
    public Instant CreatedAt { get; set; } = Instant.FromDateTimeUtc(DateTime.UtcNow);
    public Instant UpdatedAt { get; set; } = Instant.FromDateTimeUtc(DateTime.UtcNow);
    public bool IsDeleted { get; set; }
    public Instant? DeletedAt { get; set; }
    
    // Navigation properties
    [ForeignKey("OriginalCurrencyCode")] 
    public Currency OriginalCurrency { get; set; }
    public FileMetadata? Image { get; set; }
    public ApplicationUser User { get; set; }
    public ICollection<Tag> Tags { get; set; } = new List<Tag>();
}
