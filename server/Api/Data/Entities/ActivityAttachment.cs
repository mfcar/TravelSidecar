using System.ComponentModel.DataAnnotations;
using NodaTime;

namespace Api.Data.Entities;

public class ActivityAttachment
{
    // Primary key
    [Key]
    public Guid Id { get; set; }
    
    // Foreign keys
    public Guid ActivityId { get; set; }
    public Guid FileMetadataId { get; set; }
    
    // Properties
    [MaxLength(200)]
    public string? Description { get; set; } // "Boarding pass", "Hotel reservation", etc.
    
    public int SortOrder { get; set; } = 0;
    
    // Tracking properties
    public Instant CreatedAt { get; set; } = Instant.FromDateTimeUtc(DateTime.UtcNow);
    public Instant LastModifiedAt { get; set; } = Instant.FromDateTimeUtc(DateTime.UtcNow);
    
    // Navigation properties
    public JourneyActivity Activity { get; set; } = null!;
    public FileMetadata FileMetadata { get; set; } = null!;
}