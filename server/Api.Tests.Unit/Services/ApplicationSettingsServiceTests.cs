using Api.Data.Context;
using Api.Enums;
using Api.Services;
using Api.Tests.Unit.Helpers;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Xunit;

namespace Api.Tests.Unit.Services;

public class ApplicationSettingsServiceTests : IDisposable
{
    private readonly ApplicationContext _dbContext;
    private readonly IMemoryCache _memoryCache;
    private readonly ApplicationSettingsService _settingsService;

    public ApplicationSettingsServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        
        _dbContext = new ApplicationContext(options);
        _memoryCache = new MemoryCache(new MemoryCacheOptions());
        _settingsService = new ApplicationSettingsService(_dbContext, _memoryCache);
    }

    public void Dispose()
    {
        _memoryCache.Dispose();
        _dbContext.Dispose();
    }

    [Fact]
    public async Task GetApplicationSettingAsync_ShouldReturnValue_WhenSettingExists()
    {
        // Arrange
        var key = SettingKey.AllowRegistration;
        var value = true;
        var setting = TestDataBuilder.CreateApplicationSetting(key, value);
        _dbContext.ApplicationSettings.Add(setting);
        await _dbContext.SaveChangesAsync(TestContext.Current.CancellationToken);
        
        // Act
        var result = await _settingsService.GetApplicationSettingAsync<bool>(key);
        
        // Assert
        result.Should().Be(value);
    }

    [Fact]
    public async Task GetApplicationSettingAsync_ShouldThrowKeyNotFoundException_WhenSettingDoesNotExist()
    {
        // Arrange
        var key = SettingKey.LogLevel;
        
        // Act
        var act = async () => await _settingsService.GetApplicationSettingAsync<string>(key);
        
        // Assert
        await act.Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage($"Application Setting with key {key} not found to be retrieved.");
    }

    [Fact]
    public async Task GetApplicationSettingAsync_ShouldCacheValue_AfterFirstRetrieval()
    {
        // Arrange
        var key = SettingKey.LogLevel;
        var value = "Debug";
        var setting = TestDataBuilder.CreateApplicationSetting(key, value);
        _dbContext.ApplicationSettings.Add(setting);
        await _dbContext.SaveChangesAsync(TestContext.Current.CancellationToken);
        
        // Act - First call should hit database
        var result1 = await _settingsService.GetApplicationSettingAsync<string>(key);
        
        // Remove setting from database to prove second call uses cache
        _dbContext.ApplicationSettings.Remove(setting);
        await _dbContext.SaveChangesAsync(TestContext.Current.CancellationToken);
        
        // Second call should use cache
        var result2 = await _settingsService.GetApplicationSettingAsync<string>(key);
        
        // Assert
        result1.Should().Be(value);
        result2.Should().Be(value);
    }

    [Fact]
    public async Task GetApplicationSettingAsync_ShouldDeserializeComplexTypes()
    {
        // Arrange
        var key = SettingKey.LoginMethod;
        var value = LoginMethod.OidcOnly;
        var setting = TestDataBuilder.CreateApplicationSetting(key, value);
        _dbContext.ApplicationSettings.Add(setting);
        await _dbContext.SaveChangesAsync(TestContext.Current.CancellationToken);
        
        // Act
        var result = await _settingsService.GetApplicationSettingAsync<LoginMethod>(key);
        
        // Assert
        result.Should().Be(value);
    }

    [Fact]
    public async Task UpdateApplicationSettingAsync_ShouldUpdateValue_WhenSettingExists()
    {
        // Arrange
        const SettingKey key = SettingKey.AllowRegistration;
        const bool oldValue = true;
        const bool newValue = false;
        var setting = TestDataBuilder.CreateApplicationSetting(key, oldValue);
        _dbContext.ApplicationSettings.Add(setting);
        await _dbContext.SaveChangesAsync(TestContext.Current.CancellationToken);
        _dbContext.ChangeTracker.Clear();
        
        // Act
        await _settingsService.UpdateApplicationSettingAsync(key, newValue);
        
        // Assert
        var updatedSetting = await _dbContext.ApplicationSettings.FirstOrDefaultAsync(s => s.Key == key, TestContext.Current.CancellationToken);
        updatedSetting.Should().NotBeNull();
        updatedSetting!.Value.Should().Be("false");
    }

    [Fact]
    public async Task UpdateApplicationSettingAsync_ShouldThrowKeyNotFoundException_WhenSettingDoesNotExist()
    {
        // Arrange
        var key = SettingKey.OidcAutoRegister;
        var value = true;
        
        // Act
        var act = async () => await _settingsService.UpdateApplicationSettingAsync(key, value);
        
        // Assert
        await act.Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage($"Application Setting with key {key} not found to be updated.");
    }

    [Fact]
    public async Task UpdateApplicationSettingAsync_ShouldThrowArgumentException_WhenValueIsInvalid()
    {
        // Arrange
        var key = SettingKey.AllowRegistration;
        var setting = TestDataBuilder.CreateApplicationSetting(key, true);
        _dbContext.ApplicationSettings.Add(setting);
        await _dbContext.SaveChangesAsync(TestContext.Current.CancellationToken);
        
        const string invalidValue = "not a boolean";
        
        // Act
        var act = async () => await _settingsService.UpdateApplicationSettingAsync(key, invalidValue);
        
        // Assert
        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage($"Invalid value for setting {key}");
    }

    [Fact]
    public async Task UpdateApplicationSettingAsync_ShouldClearCache_AfterUpdate()
    {
        // Arrange
        const SettingKey key = SettingKey.LogLevel;
        const string oldValue = "Information";
        const string newValue = "Debug";
        var setting = TestDataBuilder.CreateApplicationSetting(key, oldValue);
        _dbContext.ApplicationSettings.Add(setting);
        await _dbContext.SaveChangesAsync(TestContext.Current.CancellationToken);
        
        // Cache the old value
        var cachedOldValue = await _settingsService.GetApplicationSettingAsync<string>(key);
        cachedOldValue.Should().Be(oldValue);
        
        // Act - Update the setting
        await _settingsService.UpdateApplicationSettingAsync(key, newValue);
        
        // Get the value again - should hit database, not cache
        var result = await _settingsService.GetApplicationSettingAsync<string>(key);
        
        // Assert
        result.Should().Be(newValue);
    }

    [Theory]
    [InlineData(SettingKey.AllowRegistration, true)]
    [InlineData(SettingKey.AllowRegistration, false)]
    [InlineData(SettingKey.OidcAutoRegister, true)]
    [InlineData(SettingKey.OidcAutoRegister, false)]
    public async Task UpdateApplicationSettingAsync_ShouldAcceptValidBooleanValues(SettingKey key, bool value)
    {
        // Arrange
        var setting = TestDataBuilder.CreateApplicationSetting(key, !value);
        _dbContext.ApplicationSettings.Add(setting);
        await _dbContext.SaveChangesAsync(TestContext.Current.CancellationToken);
        
        // Act
        await _settingsService.UpdateApplicationSettingAsync(key, value);
        
        // Assert
        var result = await _settingsService.GetApplicationSettingAsync<bool>(key);
        result.Should().Be(value);
    }

    [Theory]
    [InlineData("Trace")]
    [InlineData("Debug")]
    [InlineData("Information")]
    [InlineData("Warning")]
    [InlineData("Error")]
    [InlineData("Critical")]
    public async Task UpdateApplicationSettingAsync_ShouldAcceptValidLogLevels(string logLevel)
    {
        // Arrange
        var key = SettingKey.LogLevel;
        var setting = TestDataBuilder.CreateApplicationSetting(key, "Information");
        _dbContext.ApplicationSettings.Add(setting);
        await _dbContext.SaveChangesAsync(TestContext.Current.CancellationToken);
        
        // Act
        await _settingsService.UpdateApplicationSettingAsync(key, logLevel);
        
        // Assert
        var result = await _settingsService.GetApplicationSettingAsync<string>(key);
        result.Should().Be(logLevel);
    }

    [Theory]
    [InlineData(LoginMethod.LocalOnly)]
    [InlineData(LoginMethod.OidcOnly)]
    [InlineData(LoginMethod.Hybrid)]
    public async Task UpdateApplicationSettingAsync_ShouldAcceptValidLoginMethods(LoginMethod loginMethod)
    {
        // Arrange
        var key = SettingKey.LoginMethod;
        var setting = TestDataBuilder.CreateApplicationSetting(key, LoginMethod.Hybrid);
        _dbContext.ApplicationSettings.Add(setting);
        await _dbContext.SaveChangesAsync(TestContext.Current.CancellationToken);
        
        // Act
        await _settingsService.UpdateApplicationSettingAsync(key, loginMethod);
        
        // Assert
        var result = await _settingsService.GetApplicationSettingAsync<LoginMethod>(key);
        result.Should().Be(loginMethod);
    }

    [Fact]
    public async Task UpdateApplicationSettingAsync_ShouldAcceptIntegerForLoginMethod()
    {
        // Arrange
        var key = SettingKey.LoginMethod;
        var setting = TestDataBuilder.CreateApplicationSetting(key, LoginMethod.Hybrid);
        _dbContext.ApplicationSettings.Add(setting);
        await _dbContext.SaveChangesAsync(TestContext.Current.CancellationToken);
        
        // Act - Pass integer value instead of enum
        await _settingsService.UpdateApplicationSettingAsync(key, 1); // OidcOnly
        
        // Assert
        var result = await _settingsService.GetApplicationSettingAsync<int>(key);
        result.Should().Be(1);
    }

    [Fact]
    public async Task Service_ShouldUseAsNoTracking_ForReadOperations()
    {
        // Arrange
        var setting = TestDataBuilder.CreateApplicationSetting(SettingKey.AllowRegistration, true);
        _dbContext.ApplicationSettings.Add(setting);
        await _dbContext.SaveChangesAsync(TestContext.Current.CancellationToken);
        _dbContext.ChangeTracker.Clear();
        
        // Act
        await _settingsService.GetApplicationSettingAsync<bool>(SettingKey.AllowRegistration);
        
        // Assert
        _dbContext.ChangeTracker.Entries().Should().BeEmpty();
    }

    [Fact]
    public async Task GetApplicationSettingAsync_ShouldWorkWithConcurrentRequests()
    {
        // Arrange
        var key = SettingKey.LogLevel;
        var value = "Information";
        var setting = TestDataBuilder.CreateApplicationSetting(key, value);
        _dbContext.ApplicationSettings.Add(setting);
        await _dbContext.SaveChangesAsync(TestContext.Current.CancellationToken);
        
        // Act - Simulate concurrent requests
        var tasks = Enumerable.Range(1, 10)
            .Select(_ => _settingsService.GetApplicationSettingAsync<string>(key))
            .ToList();
        
        var results = await Task.WhenAll(tasks);
        
        // Assert
        results.Should().AllBe(value);
    }

    [Fact]
    public async Task CacheKey_ShouldBeUniquePerSettingKey()
    {
        // Arrange
        var settings = new[]
        {
            TestDataBuilder.CreateApplicationSetting(SettingKey.AllowRegistration, true),
            TestDataBuilder.CreateApplicationSetting(SettingKey.LogLevel, "Debug"),
            TestDataBuilder.CreateApplicationSetting(SettingKey.LoginMethod, LoginMethod.Hybrid),
            TestDataBuilder.CreateApplicationSetting(SettingKey.OidcAutoRegister, false)
        };
        _dbContext.ApplicationSettings.AddRange(settings);
        await _dbContext.SaveChangesAsync(TestContext.Current.CancellationToken);
        
        // Act - Get all settings to cache them
        var allowReg = await _settingsService.GetApplicationSettingAsync<bool>(SettingKey.AllowRegistration);
        var logLevel = await _settingsService.GetApplicationSettingAsync<string>(SettingKey.LogLevel);
        var loginMethod = await _settingsService.GetApplicationSettingAsync<LoginMethod>(SettingKey.LoginMethod);
        var oidcAutoReg = await _settingsService.GetApplicationSettingAsync<bool>(SettingKey.OidcAutoRegister);
        
        // Assert - All values should be correctly cached with unique keys
        allowReg.Should().Be(true);
        logLevel.Should().Be("Debug");
        loginMethod.Should().Be(LoginMethod.Hybrid);
        oidcAutoReg.Should().Be(false);
    }
}
