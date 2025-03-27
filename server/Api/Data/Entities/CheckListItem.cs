using System.ComponentModel.DataAnnotations;
using NodaTime;

namespace Api.Data.Entities;

public class CheckListItem
{
    // Primary key
    [Key]
    public Guid Id { get; set; }
    
    // Foreign keys
    public Guid CheckListTemplateId { get; set; }
    
    // Required properties
    [Required]
    [MaxLength(200)]
    public required string Description { get; set; }
    
    // Optional properties
    public int DisplayOrder { get; set; }
    public bool IsRequired { get; set; }
    [MaxLength(500)]
    public string? Notes { get; set; }
    
    // Tracking properties
    public Instant CreatedAt { get; set; } = Instant.FromDateTimeUtc(DateTime.UtcNow);
    public Instant LastModifiedAt { get; set; } = Instant.FromDateTimeUtc(DateTime.UtcNow);
    public bool IsDeleted { get; set; }
    
    // Navigation properties
    public CheckListTemplate CheckListTemplate { get; set; } = null!;
}
