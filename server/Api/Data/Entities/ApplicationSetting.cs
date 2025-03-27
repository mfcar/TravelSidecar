using System.ComponentModel.DataAnnotations;
using Api.Enums;

namespace Api.Data.Entities;

public class ApplicationSetting
{
    // Primary key
    [Key]
    public SettingKey Key { get; set; }
    
    // Required property
    [Required]
    [MaxLength(50)]
    public required string Value { get; set; }
}
