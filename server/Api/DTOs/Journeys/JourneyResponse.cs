using Api.DTOs.Tags;
using Api.Enums;

namespace Api.DTOs.Journeys;

public class JourneyResponse
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset LastModifiedAt { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public Guid? CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int? DaysUntilStart { get; set; }
    public int? JourneyDurationInDays { get; set; }
    public JourneyStatus Status { get; set; } = JourneyStatus.Unknown;

    public List<TagDto>? Tags { get; set; }
}
