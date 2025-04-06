using System.ComponentModel.DataAnnotations;
using NodaTime;

namespace Api.Data.Entities;

public class Journey
{
    // Primary key
    [Key] 
    public Guid Id { get; set; }

    // Foreign keys
    public Guid UserId { get; set; }
    public Guid? JourneyCategoryId { get; set; }

    // Required properties
    [Required] 
    [MaxLength(120)] 
    public required string Name { get; set; }

    // Optional properties
    [MaxLength(500)] 
    public string? Description { get; set; }
    public LocalDate? StartDate { get; set; }
    public LocalDate? EndDate { get; set; }
    public Guid? CoverImageId { get; set; }

    // Tracking properties
    public Instant CreatedAt { get; set; } = Instant.FromDateTimeUtc(DateTime.UtcNow);
    public Instant LastModifiedAt { get; set; } = Instant.FromDateTimeUtc(DateTime.UtcNow);
    public bool IsDeleted { get; set; }
    public Instant? DeletedAt { get; set; }

    // Navigation properties
    public ICollection<FileMetadata> Files { get; set; } = new List<FileMetadata>();
    public ICollection<Tag> Tags { get; set; } = new List<Tag>();
    public JourneyCategory JourneyCategory { get; set; } = null!;
}
