using System.ComponentModel.DataAnnotations;

namespace Api.Data.Entities;

public class Currency
{
    // Primary key
    [Key]
    [MaxLength(3)]
    public required string Code { get; set; }
    
    // Required properties
    [Required]
    [MaxLength(50)]
    public required string EnglishName { get; set; }

    [MaxLength(3)]
    public string? CountryCode { get; set; }
    
    // Navigation properties
    public ICollection<JourneyActivity>? Activities { get; set; }
}
