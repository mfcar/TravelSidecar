namespace Api.DTOs.Timezone;

public class TimezoneListResponseDto
{
    public List<TimezoneResultDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
}
