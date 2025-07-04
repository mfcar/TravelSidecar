namespace Api.DTOs.Activities;

public class ReorderActivitiesRequest
{
    public required List<ActivityOrderItem> Activities { get; set; }
}

public class ActivityOrderItem
{
    public required Guid ActivityId { get; set; }
    public int ManualSortOrder { get; set; }
}