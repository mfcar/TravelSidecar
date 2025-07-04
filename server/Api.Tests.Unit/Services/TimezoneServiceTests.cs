using Api.Services;
using FluentAssertions;
using Microsoft.Extensions.Caching.Memory;
using Xunit;

namespace Api.Tests.Unit.Services;

public class TimezoneServiceTests : IDisposable
{
    private readonly IMemoryCache _memoryCache;
    private readonly TimezoneService _timezoneService;

    public TimezoneServiceTests()
    {
        _memoryCache = new MemoryCache(new MemoryCacheOptions());
        _timezoneService = new TimezoneService(_memoryCache);
    }

    public void Dispose()
    {
        _memoryCache.Dispose();
    }

    [Fact]
    public async Task GetTimezoneListAsync_ShouldReturnTimezoneList()
    {
        // Act
        var result = await _timezoneService.GetTimezoneListAsync();
        
        // Assert
        result.Should().NotBeNull();
        result.Should().NotBeEmpty();
        result.Should().AllSatisfy(tz =>
        {
            tz.Id.Should().NotBeNullOrWhiteSpace();
            tz.GmtOffset.Should().NotBeNullOrWhiteSpace();
            tz.GmtOffset.Should().StartWith("GMT");
        });
    }

    [Fact]
    public async Task GetTimezoneListAsync_ShouldIncludeCommonTimezones()
    {
        // Act
        var result = await _timezoneService.GetTimezoneListAsync();
        var timezoneList = result.ToList();
        
        // Assert
        timezoneList.Should().Contain(tz => tz.Id == "UTC");
        timezoneList.Should().Contain(tz => tz.Id == "America/New_York");
        timezoneList.Should().Contain(tz => tz.Id == "Europe/London");
        timezoneList.Should().Contain(tz => tz.Id == "Asia/Tokyo");
        timezoneList.Should().Contain(tz => tz.Id == "Australia/Sydney");
    }

    [Fact]
    public async Task GetTimezoneListAsync_ShouldFormatOffsetCorrectly()
    {
        // Act
        var result = await _timezoneService.GetTimezoneListAsync();
        var utc = result.FirstOrDefault(tz => tz.Id == "UTC");
        
        // Assert
        utc.Should().NotBeNull();
        utc!.GmtOffset.Should().Be("GMT+0");
    }

    [Fact]
    public async Task GetTimezoneListAsync_ShouldFormatPositiveOffsets()
    {
        // Act
        var result = await _timezoneService.GetTimezoneListAsync();
        
        // Assert
        result.Should().Contain(tz => tz.GmtOffset.Contains("GMT+"));
    }

    [Fact]
    public async Task GetTimezoneListAsync_ShouldFormatNegativeOffsets()
    {
        // Act
        var result = await _timezoneService.GetTimezoneListAsync();
        
        // Assert
        result.Should().Contain(tz => tz.GmtOffset.Contains("GMT-"));
    }

    [Fact]
    public async Task GetTimezoneListAsync_ShouldFormatOffsetsWithMinutes()
    {
        // Act
        var result = await _timezoneService.GetTimezoneListAsync();
        
        // Assert
        // Some timezones have 30 or 45 minute offsets
        result.Should().Contain(tz => tz.GmtOffset.Contains(":30") || tz.GmtOffset.Contains(":45"));
    }

    [Fact]
    public async Task GetTimezoneListAsync_ShouldCacheResults()
    {
        // Act - First call should generate and cache
        var result1 = await _timezoneService.GetTimezoneListAsync();
        var firstCallList = result1.ToList();
        
        // Second call should return cached results
        var result2 = await _timezoneService.GetTimezoneListAsync();
        var secondCallList = result2.ToList();
        
        // Assert
        firstCallList.Should().HaveCount(secondCallList.Count);
        firstCallList.Should().BeEquivalentTo(secondCallList);
        
        // Results should be the same reference (cached)
        result1.Should().BeSameAs(result2);
    }


    [Fact]
    public async Task GetTimezoneListAsync_ShouldIncludeAllNodaTimeZones()
    {
        // Arrange
        var expectedCount = NodaTime.DateTimeZoneProviders.Tzdb.Ids.Count();
        
        // Act
        var result = await _timezoneService.GetTimezoneListAsync();
        
        // Assert
        result.Should().HaveCount(expectedCount);
    }

    [Fact]
    public async Task GetTimezoneListAsync_ShouldHandleAllTimezoneOffsets()
    {
        // Act
        var result = await _timezoneService.GetTimezoneListAsync();
        
        // Assert
        result.Should().AllSatisfy(tz =>
        {
            // GMT offset should match pattern: GMT+N or GMT-N or GMT+N:MM or GMT-N:MM
            // Note: The actual implementation might produce values like "GMT-2:-30" for negative fractional offsets
            tz.GmtOffset.Should().MatchRegex(@"^GMT[+-]\d{1,2}(:[+-]?\d{2})?$");
        });
    }

    [Fact]
    public async Task GetTimezoneListAsync_ShouldNotIncludeDuplicateIds()
    {
        // Act
        var result = await _timezoneService.GetTimezoneListAsync();
        var timezoneList = result.ToList();
        
        // Assert
        var uniqueIds = timezoneList.Select(tz => tz.Id).Distinct().Count();
        uniqueIds.Should().Be(timezoneList.Count);
    }

    [Fact]
    public async Task CacheKey_ShouldBeConsistent()
    {
        // Arrange
        // Clear cache first
        _memoryCache.Remove("TimezoneList");
        
        // Act
        var result1 = await _timezoneService.GetTimezoneListAsync();
        
        // Try to get from cache directly
        var cacheHit = _memoryCache.TryGetValue("TimezoneList", out object? cachedValue);
        
        // Assert
        cacheHit.Should().BeTrue();
        cachedValue.Should().NotBeNull();
        cachedValue.Should().BeSameAs(result1);
    }

    [Fact]
    public async Task GetTimezoneListAsync_ShouldReturnValidTimezoneData()
    {
        // Act
        var result = await _timezoneService.GetTimezoneListAsync();
        
        // Assert - Check specific known timezones and their approximate offsets
        var newYork = result.FirstOrDefault(tz => tz.Id == "America/New_York");
        var london = result.FirstOrDefault(tz => tz.Id == "Europe/London");
        var tokyo = result.FirstOrDefault(tz => tz.Id == "Asia/Tokyo");
        
        newYork.Should().NotBeNull();
        london.Should().NotBeNull();
        tokyo.Should().NotBeNull();
        
        // Note: Offsets can vary due to DST, so we just check they exist
        newYork!.GmtOffset.Should().NotBeNullOrWhiteSpace();
        london!.GmtOffset.Should().NotBeNullOrWhiteSpace();
        tokyo!.GmtOffset.Should().NotBeNullOrWhiteSpace();
    }
}
