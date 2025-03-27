using System.ComponentModel.DataAnnotations;
using NodaTime;

namespace Api.Data.Entities;

public class OidcProvider
{
    // Primary key
    [Key]
    public Guid Id { get; set; }
    
    // Required properties
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = null!;
    
    [Required]
    [MaxLength(50)]
    public string DisplayName { get; set; } = null!;
    
    [Required]
    [MaxLength(255)]
    public string Authority { get; set; } = null!;
    
    [Required]
    [MaxLength(255)]
    public string ClientId { get; set; } = null!;
    
    [Required]
    [MaxLength(255)]
    public string ClientSecret { get; set; } = null!;
    
    // Optional properties
    [MaxLength(1024)]
    public string? Scope { get; set; } = "openid profile email";
    
    public bool Enabled { get; set; } = true;
    public bool AutoRegisterUsers { get; set; } = false;
    
    // Tracking properties
    public Instant CreatedAt { get; set; } = Instant.FromDateTimeUtc(DateTime.UtcNow);
    public Instant? UpdatedAt { get; set; } = Instant.FromDateTimeUtc(DateTime.UtcNow);
}
