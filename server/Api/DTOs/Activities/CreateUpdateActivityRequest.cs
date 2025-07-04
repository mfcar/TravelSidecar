using Api.Enums;
using NodaTime;
using System.Text.Json;

namespace Api.DTOs.Activities;

public class CreateUpdateActivityRequest
{
    public required string Name { get; set; }
    public string? Description { get; set; }
    public ActivityType ActivityType { get; set; } = ActivityType.Other;
    
    // Time & Timezone fields
    public LocalDateTime? StartDateTime { get; set; }
    public string? StartTimezone { get; set; }
    public LocalDateTime? EndDateTime { get; set; }
    public string? EndTimezone { get; set; }
    
    // For activities without specific times
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
    
    // Type-specific data
    public JsonElement? TypeSpecificData { get; set; }
}