using System.ComponentModel.DataAnnotations;

namespace Api.DTOs.Journeys;

public class CreateUpdateJourneyRequest
{
    [Required] public required string Name { get; set; }

    public string? Description { get; set; }
    public int StartDay { get; set; }
    public int StartMonth { get; set; }
    public int StartYear { get; set; }
    public int EndDay { get; set; }
    public int EndMonth { get; set; }
    public int EndYear { get; set; }
    public string? CategoryId { get; set; }
    
    public List<Guid>? TagIds { get; set; }
}
