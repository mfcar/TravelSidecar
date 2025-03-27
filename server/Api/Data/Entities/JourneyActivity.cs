using System.ComponentModel.DataAnnotations;
using NodaTime;

namespace Api.Data.Entities;

public class JourneyActivity
{
    // Primary key
    [Key]
    public Guid Id { get; set; }
    
    // Foreign keys
    public Guid JourneyId { get; set; }
    public Guid UserId { get; set; }
    
    // Required properties
    [Required]
    [MaxLength(120)]
    public required string Name { get; set; }
    
    // Optional properties
    [MaxLength(500)]
    public string? Description { get; set; }
    public LocalDateTime? StartDateTime { get; set; }
    public LocalDateTime? EndDateTime { get; set; }
    public string? Location { get; set; }
    public decimal? Cost { get; set; }
    public string? CurrencyCode { get; set; }
    
    // Tracking properties
    public Instant CreatedAt { get; set; } = Instant.FromDateTimeUtc(DateTime.UtcNow);
    public Instant LastModifiedAt { get; set; } = Instant.FromDateTimeUtc(DateTime.UtcNow);
    public bool IsDeleted { get; set; }
    public Instant? DeletedAt { get; set; }
    
    // Navigation properties
    public Journey Journey { get; set; } = null!;
    public ApplicationUser User { get; set; } = null!;
    public Currency? Currency { get; set; }
    public ICollection<FileMetadata> Files { get; set; } = new List<FileMetadata>();
}
