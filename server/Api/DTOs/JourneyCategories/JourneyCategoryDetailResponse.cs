using Api.DTOs.Journeys;

namespace Api.DTOs.JourneyCategories;

public class JourneyCategoryDetailResponse
{
    public Guid Id { get; init; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset LastModifiedAt { get; set; }
    public int JourneysCount { get; set; }
    public List<JourneyResponse>? Journeys { get; set; }
}
