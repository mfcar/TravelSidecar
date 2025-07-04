using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Api.Enums;
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
    
    // Core properties
    [Required]
    [MaxLength(120)]
    public required string Name { get; set; }
    
    [MaxLength(500)]
    public string? Description { get; set; }
    
    public ActivityType ActivityType { get; set; } = ActivityType.Other;
    
    // Time & Timezone fields
    public LocalDateTime? StartDateTime { get; set; }
    [MaxLength(50)]
    public string? StartTimezone { get; set; } // IANA timezone ID
    
    public LocalDateTime? EndDateTime { get; set; }
    [MaxLength(50)]
    public string? EndTimezone { get; set; } // IANA timezone ID
    
    // For activities without specific times but with day assignment
    public int? DayNumber { get; set; } // Day 1, Day 2, etc.
    
    // Location fields
    [MaxLength(200)]
    public string? StartLocation { get; set; }
    [MaxLength(200)]
    public string? EndLocation { get; set; }
    [MaxLength(500)]
    public string? Address { get; set; }
    
    // Contact & Web
    [MaxLength(20)]
    public string? PhoneNumber { get; set; }
    [MaxLength(200)]
    public string? Website { get; set; }
    
    // Cost
    public decimal? Cost { get; set; }
    [MaxLength(3)]
    public string? CurrencyCode { get; set; }
    
    // Content
    [Column(TypeName = "text")]
    public string? Notes { get; set; } // Markdown supported
    
    // Sorting
    public int ManualSortOrder { get; set; } = 0;
    
    // Type-specific data (JSON column)
    [Column(TypeName = "jsonb")]
    public string? TypeSpecificData { get; set; }
    
    // Tracking properties
    public Instant CreatedAt { get; set; } = Instant.FromDateTimeUtc(DateTime.UtcNow);
    public Instant LastModifiedAt { get; set; } = Instant.FromDateTimeUtc(DateTime.UtcNow);
    public bool IsDeleted { get; set; }
    public Instant? DeletedAt { get; set; }
    
    // Audit fields (for future journey sharing)
    public Guid CreatedByUserId { get; set; }
    public Guid? LastModifiedByUserId { get; set; }
    
    // Navigation properties
    public Journey Journey { get; set; } = null!;
    public ApplicationUser User { get; set; } = null!;
    public ApplicationUser CreatedByUser { get; set; } = null!;
    public ApplicationUser? LastModifiedByUser { get; set; }
    public Currency? Currency { get; set; }
    public ICollection<ActivityAttachment> Attachments { get; set; } = new List<ActivityAttachment>();
    public ICollection<FileMetadata> Files { get; set; } = new List<FileMetadata>(); // Keep for backward compatibility
}
