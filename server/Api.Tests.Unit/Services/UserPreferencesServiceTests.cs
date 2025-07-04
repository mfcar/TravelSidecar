using Api.Data.Context;
using Api.DTOs.Preferences;
using Api.Enums;
using Api.Services;
using Api.Tests.Unit.Helpers;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using NodaTime;
using NSubstitute;
using Xunit;

namespace Api.Tests.Unit.Services;

public class UserPreferencesServiceTests : IDisposable
{
    private readonly ApplicationContext _dbContext;
    private readonly IMemoryCache _memoryCache;
    private readonly ILogger<UserPreferencesService> _logger;
    private readonly UserPreferencesService _preferencesService;

    public UserPreferencesServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        
        _dbContext = new ApplicationContext(options);
        _memoryCache = new MemoryCache(new MemoryCacheOptions());
        _logger = Substitute.For<ILogger<UserPreferencesService>>();
        _preferencesService = new UserPreferencesService(_dbContext, _memoryCache, _logger);
    }

    public void Dispose()
    {
        _memoryCache.Dispose();
        _dbContext.Dispose();
    }

    [Fact]
    public async Task GetUserPreferencesAsync_ShouldReturnUserPreferences_WhenUserExists()
    {
        // Arrange
        var user = TestDataBuilder.CreateUser("test@example.com");
        user.PreferredDateFormat = UserDateFormat.YYYY_MM_DD;
        user.PreferredTimeFormat = UserTimeFormat.HH_MM_12;
        user.PreferredFirstDayOfWeek = FirstDayOfWeek.Sunday;
        user.PreferredTimezone = "America/New_York";
        user.PreferredCurrencyCode = "USD";
        user.PreferredThemeMode = UserThemeMode.Dark;
        user.PreferredItemsPerPage = 50;
        user.PreferredLanguage = "es";
        user.IsInitialSetupComplete = true;
        
        _dbContext.ApplicationUsers.Add(user);
        await _dbContext.SaveChangesAsync(TestContext.Current.CancellationToken);
        
        // Act
        var result = await _preferencesService.GetUserPreferencesAsync(user.Id, TestContext.Current.CancellationToken);
        
        // Assert
        result.Should().NotBeNull();
        result.PreferredDateFormat.Should().Be(UserDateFormat.YYYY_MM_DD);
        result.PreferredTimeFormat.Should().Be(UserTimeFormat.HH_MM_12);
        result.PreferredFirstDayOfWeek.Should().Be(FirstDayOfWeek.Sunday);
        result.PreferredTimezone.Should().Be("America/New_York");
        result.PreferredCurrencyCode.Should().Be("USD");
        result.PreferredThemeMode.Should().Be(UserThemeMode.Dark);
        result.PreferredItemsPerPage.Should().Be(50);
        result.PreferredLanguage.Should().Be("es");
        result.IsInitialSetupComplete.Should().BeTrue();
        result.PagePreferences.Should().NotBeNull();
        result.PagePreferences.Should().BeEmpty();
    }

    [Fact]
    public async Task GetUserPreferencesAsync_ShouldThrowKeyNotFoundException_WhenUserDoesNotExist()
    {
        // Arrange
        var nonExistentUserId = Guid.NewGuid();
        
        // Act
        var act = async () => await _preferencesService.GetUserPreferencesAsync(nonExistentUserId);
        
        // Assert
        await act.Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage($"User with ID {nonExistentUserId} not found");
    }

    [Fact]
    public async Task GetUserPreferencesAsync_ShouldCachePreferences()
    {
        // Arrange
        var user = TestDataBuilder.CreateUser("cache@example.com");
        _dbContext.ApplicationUsers.Add(user);
        await _dbContext.SaveChangesAsync(TestContext.Current.CancellationToken);
        
        // Act - First call should hit database
        var result1 = await _preferencesService.GetUserPreferencesAsync(user.Id, TestContext.Current.CancellationToken);
        
        // Remove user from database to prove second call uses cache
        _dbContext.ApplicationUsers.Remove(user);
        await _dbContext.SaveChangesAsync(TestContext.Current.CancellationToken);
        
        // Second call should use cache
        var result2 = await _preferencesService.GetUserPreferencesAsync(user.Id, TestContext.Current.CancellationToken);
        
        // Assert
        result1.Should().BeEquivalentTo(result2);
    }

    [Fact]
    public async Task GetUserPreferencesAsync_ShouldDeserializePagePreferences()
    {
        // Arrange
        var user = TestDataBuilder.CreateUser("pages@example.com");
        var pagePreferences = new Dictionary<string, ListPagePreferencesDto>
        {
            ["PageTags"] = new ListPagePreferencesDto
            {
                ViewMode = ListViewMode.Grid,
                SortBy = "name",
                SortOrder = "desc",
                SelectedFields = ["name", "color", "count"]
            }
        };
        user.PagePreferences = System.Text.Json.JsonSerializer.Serialize(pagePreferences);
        
        _dbContext.ApplicationUsers.Add(user);
        await _dbContext.SaveChangesAsync(TestContext.Current.CancellationToken);
        
        // Act
        var result = await _preferencesService.GetUserPreferencesAsync(user.Id, TestContext.Current.CancellationToken);
        
        // Assert
        result.PagePreferences.Should().HaveCount(1);
        result.PagePreferences["PageTags"].ViewMode.Should().Be(ListViewMode.Grid);
        result.PagePreferences["PageTags"].SortBy.Should().Be("name");
        result.PagePreferences["PageTags"].SortOrder.Should().Be("desc");
        result.PagePreferences["PageTags"].SelectedFields.Should().BeEquivalentTo(new[] { "name", "color", "count" });
    }

    [Fact]
    public async Task UpdateBasicPreferencesAsync_ShouldUpdateAllProvidedFields()
    {
        // Arrange
        var user = TestDataBuilder.CreateUser("update@example.com");
        var originalLastModified = user.LastModifiedAt;
        _dbContext.ApplicationUsers.Add(user);
        await _dbContext.SaveChangesAsync(TestContext.Current.CancellationToken);
        _dbContext.ChangeTracker.Clear();
        
        var updateDto = new BasicUserPreferencesDto
        {
            PreferredDateFormat = UserDateFormat.MM_DD_YYYY_SLASH,
            PreferredTimeFormat = UserTimeFormat.HH_MM_12,
            PreferredFirstDayOfWeek = FirstDayOfWeek.Monday,
            PreferredTimezone = "Europe/London",
            PreferredCurrencyCode = "GBP",
            PreferredThemeMode = UserThemeMode.Light,
            PreferredItemsPerPage = 100,
            PreferredLanguage = "fr"
        };
        
        // Act
        await _preferencesService.UpdateBasicPreferencesAsync(user.Id, updateDto, TestContext.Current.CancellationToken);
        
        // Assert
        var updatedUser = await _dbContext.ApplicationUsers.FirstAsync(u => u.Id == user.Id, TestContext.Current.CancellationToken);
        updatedUser.PreferredDateFormat.Should().Be(UserDateFormat.MM_DD_YYYY_SLASH);
        updatedUser.PreferredTimeFormat.Should().Be(UserTimeFormat.HH_MM_12);
        updatedUser.PreferredFirstDayOfWeek.Should().Be(FirstDayOfWeek.Monday);
        updatedUser.PreferredTimezone.Should().Be("Europe/London");
        updatedUser.PreferredCurrencyCode.Should().Be("GBP");
        updatedUser.PreferredThemeMode.Should().Be(UserThemeMode.Light);
        updatedUser.PreferredItemsPerPage.Should().Be(100);
        updatedUser.PreferredLanguage.Should().Be("fr");
        var now = SystemClock.Instance.GetCurrentInstant();
        updatedUser.LastModifiedAt.Should().BeGreaterThanOrEqualTo(originalLastModified);
        updatedUser.LastModifiedAt.Should().BeLessThanOrEqualTo(now);
    }

    [Fact]
    public async Task UpdateBasicPreferencesAsync_ShouldOnlyUpdateProvidedFields()
    {
        // Arrange
        var user = TestDataBuilder.CreateUser("partial@example.com");
        user.PreferredDateFormat = UserDateFormat.DD_MM_YYYY;
        user.PreferredTimeFormat = UserTimeFormat.HH_MM_24;
        user.PreferredCurrencyCode = "EUR";
        _dbContext.ApplicationUsers.Add(user);
        await _dbContext.SaveChangesAsync(TestContext.Current.CancellationToken);
        
        var updateDto = new BasicUserPreferencesDto
        {
            PreferredDateFormat = UserDateFormat.YYYY_MM_DD,
            // Only updating date format, other fields remain null
        };
        
        // Act
        await _preferencesService.UpdateBasicPreferencesAsync(user.Id, updateDto, TestContext.Current.CancellationToken);
        
        // Assert
        var updatedUser = await _dbContext.ApplicationUsers.FirstAsync(u => u.Id == user.Id, TestContext.Current.CancellationToken);
        updatedUser.PreferredDateFormat.Should().Be(UserDateFormat.YYYY_MM_DD); // Updated
        updatedUser.PreferredTimeFormat.Should().Be(UserTimeFormat.HH_MM_24); // Unchanged
        updatedUser.PreferredCurrencyCode.Should().Be("EUR"); // Unchanged
    }

    [Fact]
    public async Task UpdateBasicPreferencesAsync_ShouldInvalidateCache()
    {
        // Arrange
        var user = TestDataBuilder.CreateUser("invalidate@example.com");
        _dbContext.ApplicationUsers.Add(user);
        await _dbContext.SaveChangesAsync(TestContext.Current.CancellationToken);
        
        // Cache the preferences
        var initialPrefs = await _preferencesService.GetUserPreferencesAsync(user.Id, TestContext.Current.CancellationToken);
        initialPrefs.PreferredLanguage.Should().Be("en");
        
        // Act - Update preferences
        await _preferencesService.UpdateBasicPreferencesAsync(user.Id, new BasicUserPreferencesDto
        {
            PreferredLanguage = "de"
        }, TestContext.Current.CancellationToken);
        
        // Get preferences again
        var updatedPrefs = await _preferencesService.GetUserPreferencesAsync(user.Id, TestContext.Current.CancellationToken);
        
        // Assert
        updatedPrefs.PreferredLanguage.Should().Be("de");
    }

    [Fact]
    public async Task UpdateBasicPreferencesAsync_ShouldThrowKeyNotFoundException_WhenUserDoesNotExist()
    {
        // Arrange
        var nonExistentUserId = Guid.NewGuid();
        var updateDto = new BasicUserPreferencesDto { PreferredLanguage = "es" };
        
        // Act
        var act = async () => await _preferencesService.UpdateBasicPreferencesAsync(nonExistentUserId, updateDto);
        
        // Assert
        await act.Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage($"User with ID {nonExistentUserId} not found");
    }

    [Fact]
    public async Task UpdatePagePreferencesAsync_ShouldAddNewPagePreference()
    {
        // Arrange
        var user = TestDataBuilder.CreateUser("page@example.com");
        _dbContext.ApplicationUsers.Add(user);
        await _dbContext.SaveChangesAsync(TestContext.Current.CancellationToken);
        
        var pagePrefs = new ListPagePreferencesDto
        {
            ViewMode = ListViewMode.Table,
            SortBy = "createdAt",
            SortOrder = "asc",
            SelectedFields = ["id", "name", "createdAt"]
        };
        
        // Act
        await _preferencesService.UpdatePagePreferencesAsync(user.Id, "PageJourneys", pagePrefs, TestContext.Current.CancellationToken);
        
        // Assert
        var updatedUser = await _dbContext.ApplicationUsers.FirstAsync(u => u.Id == user.Id, TestContext.Current.CancellationToken);
        updatedUser.PagePreferences.Should().NotBeNullOrEmpty();
        
        var deserializedPrefs = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, ListPagePreferencesDto>>(updatedUser.PagePreferences!);
        deserializedPrefs.Should().ContainKey("PageJourneys");
        deserializedPrefs!["PageJourneys"].ViewMode.Should().Be(ListViewMode.Table);
    }

    [Fact]
    public async Task UpdatePagePreferencesAsync_ShouldUpdateExistingPagePreference()
    {
        // Arrange
        var user = TestDataBuilder.CreateUser("updatepage@example.com");
        var existingPrefs = new Dictionary<string, ListPagePreferencesDto>
        {
            ["PageTags"] = new ListPagePreferencesDto
            {
                ViewMode = ListViewMode.Grid,
                SortBy = "name",
                SortOrder = "asc",
                SelectedFields = ["name"]
            }
        };
        user.PagePreferences = System.Text.Json.JsonSerializer.Serialize(existingPrefs);
        _dbContext.ApplicationUsers.Add(user);
        await _dbContext.SaveChangesAsync(TestContext.Current.CancellationToken);
        
        var updatedPagePrefs = new ListPagePreferencesDto
        {
            ViewMode = ListViewMode.Stack,
            SortBy = "color",
            SortOrder = "desc",
            SelectedFields = ["name", "color", "count"]
        };
        
        // Act
        await _preferencesService.UpdatePagePreferencesAsync(user.Id, "PageTags", updatedPagePrefs, TestContext.Current.CancellationToken);
        
        // Assert
        var updatedUser = await _dbContext.ApplicationUsers.FirstAsync(u => u.Id == user.Id, TestContext.Current.CancellationToken);
        var deserializedPrefs = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, ListPagePreferencesDto>>(updatedUser.PagePreferences!);
        deserializedPrefs!["PageTags"].ViewMode.Should().Be(ListViewMode.Stack);
        deserializedPrefs["PageTags"].SortBy.Should().Be("color");
        deserializedPrefs["PageTags"].SortOrder.Should().Be("desc");
    }

    [Fact]
    public async Task UpdateBatchPagePreferencesAsync_ShouldUpdateMultiplePages()
    {
        // Arrange
        var user = TestDataBuilder.CreateUser("batch@example.com");
        _dbContext.ApplicationUsers.Add(user);
        await _dbContext.SaveChangesAsync(TestContext.Current.CancellationToken);
        
        var batchUpdate = new Dictionary<string, ListPagePreferencesDto>
        {
            ["PageJourneys"] = new ListPagePreferencesDto
            {
                ViewMode = ListViewMode.Grid,
                SortBy = "startDate",
                SortOrder = "desc",
                SelectedFields = ["name", "startDate", "endDate"]
            },
            ["PageBucketList"] = new ListPagePreferencesDto
            {
                ViewMode = ListViewMode.Stack,
                SortBy = "priority",
                SortOrder = "asc",
                SelectedFields = ["name", "type", "priority"]
            }
        };
        
        // Act
        await _preferencesService.UpdateBatchPagePreferencesAsync(user.Id, batchUpdate, TestContext.Current.CancellationToken);
        
        // Assert
        var updatedUser = await _dbContext.ApplicationUsers.FirstAsync(u => u.Id == user.Id, TestContext.Current.CancellationToken);
        var deserializedPrefs = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, ListPagePreferencesDto>>(updatedUser.PagePreferences!);
        
        deserializedPrefs.Should().ContainKey("PageJourneys");
        deserializedPrefs.Should().ContainKey("PageBucketList");
        deserializedPrefs!["PageJourneys"].ViewMode.Should().Be(ListViewMode.Grid);
        deserializedPrefs["PageBucketList"].ViewMode.Should().Be(ListViewMode.Stack);
    }

    [Fact]
    public async Task CompleteInitialSetupAsync_ShouldSetIsInitialSetupCompleteToTrue()
    {
        // Arrange
        var user = TestDataBuilder.CreateUser("setup@example.com");
        user.IsInitialSetupComplete = false;
        var originalLastModified = user.LastModifiedAt;
        _dbContext.ApplicationUsers.Add(user);
        await _dbContext.SaveChangesAsync(TestContext.Current.CancellationToken);
        
        // Act
        await _preferencesService.CompleteInitialSetupAsync(user.Id, TestContext.Current.CancellationToken);
        
        // Assert
        var updatedUser = await _dbContext.ApplicationUsers.FirstAsync(u => u.Id == user.Id, TestContext.Current.CancellationToken);
        updatedUser.IsInitialSetupComplete.Should().BeTrue();
        var now = SystemClock.Instance.GetCurrentInstant();
        updatedUser.LastModifiedAt.Should().BeGreaterThanOrEqualTo(originalLastModified);
        updatedUser.LastModifiedAt.Should().BeLessThanOrEqualTo(now);
    }

    [Fact]
    public async Task CompleteInitialSetupAsync_ShouldInvalidateCache()
    {
        // Arrange
        var user = TestDataBuilder.CreateUser("setupcache@example.com");
        user.IsInitialSetupComplete = false;
        _dbContext.ApplicationUsers.Add(user);
        await _dbContext.SaveChangesAsync(TestContext.Current.CancellationToken);
        
        // Cache the preferences
        var initialPrefs = await _preferencesService.GetUserPreferencesAsync(user.Id, TestContext.Current.CancellationToken);
        initialPrefs.IsInitialSetupComplete.Should().BeFalse();
        
        // Act
        await _preferencesService.CompleteInitialSetupAsync(user.Id, TestContext.Current.CancellationToken);
        
        // Get preferences again
        var updatedPrefs = await _preferencesService.GetUserPreferencesAsync(user.Id, TestContext.Current.CancellationToken);
        
        // Assert
        updatedPrefs.IsInitialSetupComplete.Should().BeTrue();
    }

    [Fact]
    public async Task InvalidateCacheAsync_ShouldRemoveCachedPreferences()
    {
        // Arrange
        var user = TestDataBuilder.CreateUser("invalidatecache@example.com");
        _dbContext.ApplicationUsers.Add(user);
        await _dbContext.SaveChangesAsync(TestContext.Current.CancellationToken);
        
        // Cache the preferences
        await _preferencesService.GetUserPreferencesAsync(user.Id, TestContext.Current.CancellationToken);
        
        // Act
        await _preferencesService.InvalidateCacheAsync(user.Id);
        
        // Try to get from cache directly
        var cacheKey = $"USER_PREFERENCES_{user.Id}";
        var cacheHit = _memoryCache.TryGetValue(cacheKey, out _);
        
        // Assert
        cacheHit.Should().BeFalse();
    }

    [Fact]
    public async Task Service_ShouldHandleInvalidPagePreferencesJson()
    {
        // Arrange
        var user = TestDataBuilder.CreateUser("invalidjson@example.com");
        user.PagePreferences = "{ invalid json }";
        _dbContext.ApplicationUsers.Add(user);
        await _dbContext.SaveChangesAsync(TestContext.Current.CancellationToken);
        
        // Act
        var result = await _preferencesService.GetUserPreferencesAsync(user.Id, TestContext.Current.CancellationToken);
        
        // Assert
        result.PagePreferences.Should().NotBeNull();
        result.PagePreferences.Should().BeEmpty();
        
        _logger.Received(1).Log(
            LogLevel.Error,
            Arg.Any<EventId>(),
            Arg.Is<object>(v => v.ToString().Contains("Error deserializing page preferences")),
            Arg.Any<Exception>(),
            Arg.Any<Func<object, Exception?, string>>());
    }

    [Fact]
    public async Task Service_ShouldUseAsNoTracking_ForReadOperations()
    {
        // Arrange
        var user = TestDataBuilder.CreateUser("notracking@example.com");
        _dbContext.ApplicationUsers.Add(user);
        await _dbContext.SaveChangesAsync(TestContext.Current.CancellationToken);
        _dbContext.ChangeTracker.Clear();
        
        // Act
        await _preferencesService.GetUserPreferencesAsync(user.Id, TestContext.Current.CancellationToken);
        
        // Assert
        _dbContext.ChangeTracker.Entries().Should().BeEmpty();
    }

    [Theory]
    [InlineData(UserThemeMode.System)]
    [InlineData(UserThemeMode.Light)]
    [InlineData(UserThemeMode.Dark)]
    public async Task UpdateBasicPreferencesAsync_ShouldAcceptAllThemeModes(UserThemeMode themeMode)
    {
        // Arrange
        var user = TestDataBuilder.CreateUser($"theme{themeMode}@example.com");
        _dbContext.ApplicationUsers.Add(user);
        await _dbContext.SaveChangesAsync(TestContext.Current.CancellationToken);
        
        // Act
        await _preferencesService.UpdateBasicPreferencesAsync(user.Id, new BasicUserPreferencesDto
        {
            PreferredThemeMode = themeMode
        }, TestContext.Current.CancellationToken);
        
        // Assert
        var updatedUser = await _dbContext.ApplicationUsers.FirstAsync(u => u.Id == user.Id, TestContext.Current.CancellationToken);
        updatedUser.PreferredThemeMode.Should().Be(themeMode);
    }

    [Theory]
    [InlineData(10)]
    [InlineData(25)]
    [InlineData(50)]
    [InlineData(100)]
    public async Task UpdateBasicPreferencesAsync_ShouldAcceptValidItemsPerPage(int itemsPerPage)
    {
        // Arrange
        var user = TestDataBuilder.CreateUser($"items{itemsPerPage}@example.com");
        _dbContext.ApplicationUsers.Add(user);
        await _dbContext.SaveChangesAsync(TestContext.Current.CancellationToken);
        
        // Act
        await _preferencesService.UpdateBasicPreferencesAsync(user.Id, new BasicUserPreferencesDto
        {
            PreferredItemsPerPage = itemsPerPage
        }, TestContext.Current.CancellationToken);
        
        // Assert
        var updatedUser = await _dbContext.ApplicationUsers.FirstAsync(u => u.Id == user.Id, TestContext.Current.CancellationToken);
        updatedUser.PreferredItemsPerPage.Should().Be(itemsPerPage);
    }
}
