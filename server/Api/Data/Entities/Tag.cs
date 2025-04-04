using System.ComponentModel.DataAnnotations;
using NodaTime;

namespace Api.Data.Entities;

public class Tag
{
    // Primary key
    [Key]
    public Guid Id { get; set; }
    
    // Foreign keys
    public Guid UserId { get; set; }
    
    // Required properties
    [Required]
    [MaxLength(50)]
    public required string Name { get; set; }
    
    [Required]
    [MaxLength(10)]
    public required string Color { get; set; }
    
    // Tracking properties
    public Instant CreatedAt { get; set; } = Instant.FromDateTimeUtc(DateTime.UtcNow);
    public Instant LastModifiedAt { get; set; } = Instant.FromDateTimeUtc(DateTime.UtcNow);
    public bool IsDeleted { get; set; }
    public Instant? DeletedAt { get; set; }
    
    // Navigation properties
    public ICollection<BucketListItem> BucketListItems { get; set; } = new List<BucketListItem>();
    public ICollection<FileMetadata> Files { get; set; } = new List<FileMetadata>();
    public ICollection<Journey> Journeys { get; set; } = new List<Journey>();
    public ICollection<JourneyActivity> JourneyActivities { get; set; } = new List<JourneyActivity>();
}
