using Api.DTOs.Timezone;
using Microsoft.Extensions.Caching.Memory;
using NodaTime;

namespace Api.Services;

public interface ITimezoneService
{
    Task<IEnumerable<TimezoneResultDto>> GetTimezoneListAsync();
}

public class TimezoneService(IMemoryCache cache) : ITimezoneService
{
    private const string CacheKey = "TimezoneList";
    private static readonly TimeSpan CacheExpirationInMinutes = TimeSpan.FromMinutes(60);

    public async Task<IEnumerable<TimezoneResultDto>> GetTimezoneListAsync()
    {
        if (cache.TryGetValue(CacheKey, out List<TimezoneResultDto>? cachedList))
        {
            return cachedList!;
        }

        var timezoneList = GenerateTimezoneList();

        cache.Set(CacheKey, timezoneList, new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = CacheExpirationInMinutes
        });

        return timezoneList;
    }

    private List<TimezoneResultDto> GenerateTimezoneList()
    {
        var timeZoneProvider = DateTimeZoneProviders.Tzdb;
        var currentInstant = SystemClock.Instance.GetCurrentInstant();
        return timeZoneProvider.Ids
            .Select(id =>
            {
                var timeZone = timeZoneProvider[id];
                var currentOffset = timeZone.GetUtcOffset(currentInstant);
                var offsetString = FormatOffset(currentOffset);
                return new TimezoneResultDto
                {
                    Id = id,
                    GmtOffset = $"GMT{offsetString}"
                };
            })
            .OrderBy(tz => tz.Id)
            .ToList();
    }

    private string FormatOffset(Offset offset)
    {
        var totalSeconds = offset.Seconds;
        var totalMinutes = totalSeconds / 60;
        var hours = totalMinutes / 60;
        var minutes = totalMinutes % 60;

        return minutes == 0
            ? $"{hours:+#;-#;+0}"
            : $"{hours:+#;-#;+0}:{minutes:00}";
    }
}
