namespace Api.DTOs.Tags;

public class TagDto
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public string? Color { get; set; }
}
