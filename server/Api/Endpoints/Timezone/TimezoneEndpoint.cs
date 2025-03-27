using Api.DTOs.Timezone;
using Api.Services;

namespace Api.Endpoints.Timezone;

public static class TimezoneEndpoint
{
    public static async Task<IResult> GetTimezoneListAsync(ITimezoneService timezoneService)
    {
        var timezonesList = (await timezoneService.GetTimezoneListAsync()).ToList();

        var response = new TimezoneListResponseDto
        {
            Items = timezonesList,
            TotalCount = timezonesList.Count
        };
    
        return TypedResults.Ok(response);
    }
}
