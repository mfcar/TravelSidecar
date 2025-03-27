using System.ComponentModel.DataAnnotations;
using NodaTime;

namespace Api.Data.Entities;

public class CheckListTemplate
{
    // Primary key
    [Key]
    public Guid Id { get; set; }
    
    // Foreign key
    public Guid UserId { get; set; }
    
    // Required properties
    [Required]
    [MaxLength(120)]
    public required string Name { get; set; }
    
    // Optional properties
    [MaxLength(500)]
    public string? Description { get; set; }
    public bool IsPublic { get; set; }
    
    // Tracking properties
    public Instant CreatedAt { get; set; } = Instant.FromDateTimeUtc(DateTime.UtcNow);
    public Instant LastModifiedAt { get; set; } = Instant.FromDateTimeUtc(DateTime.UtcNow);
    public bool IsDeleted { get; set; }
    public Instant? DeletedAt { get; set; }
    
    // Navigation properties
    public ApplicationUser User { get; set; } = null!;
    public ICollection<CheckListItem> Items { get; set; } = new List<CheckListItem>();
}
