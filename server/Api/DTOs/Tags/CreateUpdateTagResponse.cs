using Api.Data.Entities;
using Api.DTOs.Journeys;

namespace Api.DTOs.Tags;

public class CreateUpdateTagResponse
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Color { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset LastModifiedAt { get; set; }
    public int JourneysCount { get; set; }
    public int BucketListItemCount { get; set; }
    public List<JourneyResponse> JourneysList { get; set; } = [];
    public List<BucketListItem> BucketListItemsList { get; set; } = [];
}
