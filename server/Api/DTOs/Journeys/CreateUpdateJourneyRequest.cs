using System.ComponentModel.DataAnnotations;

namespace Api.DTOs.Journeys;

public class CreateUpdateJourneyRequest
{
    [Required] public required string Name { get; set; }

    public string? Description { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public string? CategoryId { get; set; }
    
    public List<Guid>? TagIds { get; set; }
}
