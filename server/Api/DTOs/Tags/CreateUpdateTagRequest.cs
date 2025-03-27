using System.ComponentModel.DataAnnotations;

namespace Api.DTOs.Tags;

public class CreateUpdateTagRequest
{
    [Required]
    public required string Name { get; set; }
    [Required]
    public required string Color { get; set; }
}
