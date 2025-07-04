using Api.DTOs;
using Api.Enums;

namespace Api.DTOs.Activities;

public class ActivityFilterRequest : QueryParameters
{
    public List<ActivityType>? ActivityTypes { get; set; }
    public string? SearchText { get; set; }
    public bool IncludeDeleted { get; set; } = false;
}