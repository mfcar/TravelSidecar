using System.ComponentModel.DataAnnotations;

namespace Api.DTOs.Config;

public class DatabaseConfiguration
{
    [Required]
    public required string User { get; set; }
    
    [Required]
    public required string Password { get; set; }
    
    [Required]
    public required string Name { get; set; }
    
    [Required]
    public required string Host { get; set; }
    
    [Range(1, 65535)]
    public int Port { get; set; }
    
    public bool ErrorDetails { get; set; }
}
