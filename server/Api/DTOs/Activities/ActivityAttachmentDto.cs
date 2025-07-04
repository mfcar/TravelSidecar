namespace Api.DTOs.Activities;

public class ActivityAttachmentDto
{
    public Guid Id { get; set; }
    public Guid FileMetadataId { get; set; }
    public string? Description { get; set; }
    public int SortOrder { get; set; }
    
    // File information for display
    public string? FileName { get; set; }
    public string? FileType { get; set; }
    public long? FileSize { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string? FileUrl { get; set; }
}