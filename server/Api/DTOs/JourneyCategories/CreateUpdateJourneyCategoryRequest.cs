using System.ComponentModel.DataAnnotations;

namespace Api.DTOs.JourneyCategories;

public class CreateUpdateJourneyCategoryRequest
{
    [Required] public required string Name { get; set; }

    public string? Description { get; set; }
}
