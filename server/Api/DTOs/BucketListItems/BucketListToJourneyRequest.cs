namespace Api.DTOs.BucketListItems;

public class BucketListToJourneyRequest
{
    public required List<Guid> ItemIds { get; init; }
    public required Guid JourneyId { get; init; }
    public required BucketListToJourneyAction Action { get; init; }
}

public enum BucketListToJourneyAction
{
    Copy,
    Move
}