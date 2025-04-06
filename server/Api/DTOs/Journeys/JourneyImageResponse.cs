namespace Api.DTOs.Journeys;

public class JourneyImage
{
    public Guid Id { get; set; }
    public Guid JourneyId { get; set; }
    public string Url { get; set; } = null!;
    public string FileName { get; set; } = null!;
    public string ContentType { get; set; } = null!;
    public long SizeInBytes { get; set; }
    public DateTime CreatedAt { get; set; }
}
