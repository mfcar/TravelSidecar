using Api.Enums;
using NodaTime;

namespace Api.DTOs.Activities;

public class ActivityBaseDto
{
    public Guid? Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ActivityType ActivityType { get; set; } = ActivityType.Other;
    
    // Time & Timezone fields
    public LocalDateTime? StartDateTime { get; set; }
    public string? StartTimezone { get; set; } // IANA timezone ID
    public LocalDateTime? EndDateTime { get; set; }
    public string? EndTimezone { get; set; } // IANA timezone ID
    
    // For activities without specific times but with day assignment
    public int? DayNumber { get; set; }
    
    // Location fields
    public string? StartLocation { get; set; }
    public string? EndLocation { get; set; }
    public string? Address { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Website { get; set; }
    
    // Cost
    public decimal? Cost { get; set; }
    public string? CurrencyCode { get; set; }
    
    // Content
    public string? Notes { get; set; }
    
    // Sorting
    public int ManualSortOrder { get; set; } = 0;
    
    // Attachments
    public List<ActivityAttachmentDto> Attachments { get; set; } = new();
    
    // Tracking
    public Instant? CreatedAt { get; set; }
    public Instant? LastModifiedAt { get; set; }
    
    // Audit (for shared journeys)
    public Guid? CreatedByUserId { get; set; }
    public string? CreatedByUserName { get; set; }
    public Guid? LastModifiedByUserId { get; set; }
    public string? LastModifiedByUserName { get; set; }
}