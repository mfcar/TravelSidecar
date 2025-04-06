using System.ComponentModel.DataAnnotations;
using Api.Enums;
using NodaTime;

namespace Api.Data.Entities;

public class FileMetadata
{
    // Primary key
    [Key] 
    public Guid Id { get; init; }

    // Foreign keys
    [Required] 
    public Guid UserId { get; set; }
    public Guid? JourneyId { get; set; }
    public Guid? ActivityId { get; set; }
    public Guid? BucketListItemId { get; set; }

    // Required properties
    [Required] 
    [MaxLength(200)] 
    public string FileName { get; set; } = null!;
    [Required] 
    [MaxLength(100)] 
    public string ContentType { get; set; } = null!;
    [Required] 
    [MaxLength(300)] 
    public string StoragePath { get; set; } = null!;
    public long FileSize { get; set; }

    // File properties
    public FileVisibility Visibility { get; set; } = FileVisibility.Private;
    public FileType Type { get; set; }
    public FileCategory? Category { get; set; }
    public FileStorageStatus StorageStatus { get; set; } = FileStorageStatus.Available;
    
    // Security properties
    public bool IsEncrypted { get; set; }
    [MaxLength(100)] 
    public string? EncryptionKeyId { get; set; }
    
    
    // Tracking properties
    public Instant CreatedAt { get; init; } = Instant.FromDateTimeUtc(DateTime.UtcNow);
    public Instant LastModifiedAt { get; set; } = Instant.FromDateTimeUtc(DateTime.UtcNow);
    public bool IsDeleted { get; set; }
    public Instant? DeletedAt { get; set; }
    
    // Navigation properties
    public ICollection<Tag> Tags { get; set; } = new List<Tag>();
}
