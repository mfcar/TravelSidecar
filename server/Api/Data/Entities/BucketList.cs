using System.ComponentModel.DataAnnotations;
using NodaTime;

namespace Api.Data.Entities;

public class BucketList
{
    // Primary key
    [Key]
    public Guid Id { get; init; }
    
    // Foreign keys
    public Guid UserId { get; init; }
    
    // Required properties
    [Required]
    [MaxLength(120)]
    public required string Name { get; set; }
    
    // Optional properties
    [MaxLength(500)]
    public string? Description { get; set; }
    
    // Tracking properties
    public Instant CreatedAt { get; init; } = Instant.FromDateTimeUtc(DateTime.UtcNow);
    public Instant LastModifiedAt { get; set; } = Instant.FromDateTimeUtc(DateTime.UtcNow);
    public bool IsDeleted { get; init; }
    public Instant? DeletedAt { get; init; }
    
    // Navigation properties
    public ApplicationUser User { get; set; }
    public ICollection<BucketListItem>? Items { get; set; }
}

