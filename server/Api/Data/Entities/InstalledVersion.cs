using System.ComponentModel.DataAnnotations;
using NodaTime;

namespace Api.Data.Entities;

public class InstalledVersion
{
    // Primary key
    [Key]
    public int Id { get; set; }
    
    // Required properties
    [Required]
    [MaxLength(20)]
    public required string Version { get; set; }
    
    // Tracking properties
    public Instant InstalledAt { get; set; } = Instant.FromDateTimeUtc(DateTime.UtcNow);
}
