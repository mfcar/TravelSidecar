namespace Api.DTOs.JourneyCategories;

public class CreateUpdateJourneyCategoryResponse
{
    public Guid Id { get; init; }

    public required string Name { get; set; }

    public string? Description { get; set; }
    
    public DateTimeOffset CreatedAt { get; set; }
    
    public DateTimeOffset LastModifiedAt { get; set; }
}
