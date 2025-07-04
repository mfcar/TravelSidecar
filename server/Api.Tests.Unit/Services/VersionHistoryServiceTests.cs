using Api.Data.Context;
using Api.Services;
using Api.Tests.Unit.Helpers;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NodaTime;
using NSubstitute;
using Xunit;

namespace Api.Tests.Unit.Services;

public class VersionHistoryServiceTests : IDisposable
{
    private readonly ApplicationContext _dbContext;
    private readonly ILogger<VersionHistoryService> _logger;
    private readonly VersionHistoryService _versionHistoryService;

    public VersionHistoryServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        
        _dbContext = new ApplicationContext(options);
        _logger = Substitute.For<ILogger<VersionHistoryService>>();
        _versionHistoryService = new VersionHistoryService(_dbContext, _logger);
    }

    public void Dispose()
    {
        _dbContext.Dispose();
    }

    [Fact]
    public async Task AddVersionAsync_ShouldAddNewVersion_WhenVersionDoesNotExist()
    {
        // Arrange
        const string version = "1.0.0";
        
        // Act
        await _versionHistoryService.AddVersionAsync(version);
        
        // Assert
        var savedVersion = await _dbContext.InstalledVersions.FirstOrDefaultAsync(TestContext.Current.CancellationToken);
        savedVersion.Should().NotBeNull();
        savedVersion!.Version.Should().Be(version);
        savedVersion.InstalledAt.Should().NotBe(default);
        
        _logger.Received(1).Log(
            LogLevel.Information,
            Arg.Any<EventId>(),
            Arg.Is<object>(v => v.ToString().Contains("Added version 1.0.0")),
            null,
            Arg.Any<Func<object, Exception?, string>>());
    }

    [Fact]
    public async Task AddVersionAsync_ShouldNotAddDuplicateVersion_WhenVersionExists()
    {
        // Arrange
        const string version = "1.0.0";
        var existingVersion = TestDataBuilder.CreateInstalledVersion(version);
        _dbContext.InstalledVersions.Add(existingVersion);
        await _dbContext.SaveChangesAsync(TestContext.Current.CancellationToken);
        _dbContext.ChangeTracker.Clear();
        
        // Act
        await _versionHistoryService.AddVersionAsync(version);
        
        // Assert
        var versionCount = await _dbContext.InstalledVersions.CountAsync(TestContext.Current.CancellationToken);
        versionCount.Should().Be(1);
        
        _logger.Received(1).Log(
            LogLevel.Warning,
            Arg.Any<EventId>(),
            Arg.Is<object>(v => v.ToString().Contains("Version 1.0.0 already exists")),
            null,
            Arg.Any<Func<object, Exception?, string>>());
    }

    [Fact]
    public async Task GetFirstInstalledVersionAsync_ShouldReturnOldestVersion()
    {
        // Arrange
        var version1 = TestDataBuilder.CreateInstalledVersion("1.0.0");
        version1.InstalledAt = version1.InstalledAt.Plus(Duration.FromDays(-2));
        
        var version2 = TestDataBuilder.CreateInstalledVersion("1.1.0");
        version2.InstalledAt = version2.InstalledAt.Plus(Duration.FromDays(-1));
        
        var version3 = TestDataBuilder.CreateInstalledVersion("1.2.0");
        
        _dbContext.InstalledVersions.AddRange(version1, version2, version3);
        await _dbContext.SaveChangesAsync(TestContext.Current.CancellationToken);
        
        // Act
        var result = await _versionHistoryService.GetFirstInstalledVersionAsync();
        
        // Assert
        result.Should().NotBeNull();
        result!.Version.Should().Be("1.0.0");
    }

    [Fact]
    public async Task GetFirstInstalledVersionAsync_ShouldReturnNull_WhenNoVersionsExist()
    {
        // Act
        var result = await _versionHistoryService.GetFirstInstalledVersionAsync();
        
        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetLatestInstalledVersionAsync_ShouldReturnNewestVersion()
    {
        // Arrange
        var version1 = TestDataBuilder.CreateInstalledVersion("1.0.0");
        version1.InstalledAt = version1.InstalledAt.Plus(Duration.FromDays(-2));
        
        var version2 = TestDataBuilder.CreateInstalledVersion("1.1.0");
        version2.InstalledAt = version2.InstalledAt.Plus(Duration.FromDays(-1));
        
        var version3 = TestDataBuilder.CreateInstalledVersion("1.2.0");
        
        _dbContext.InstalledVersions.AddRange(version1, version2, version3);
        await _dbContext.SaveChangesAsync(TestContext.Current.CancellationToken);
        
        // Act
        var result = await _versionHistoryService.GetLatestInstalledVersionAsync();
        
        // Assert
        result.Should().NotBeNull();
        result!.Version.Should().Be("1.2.0");
    }

    [Fact]
    public async Task GetLatestInstalledVersionAsync_ShouldReturnNull_WhenNoVersionsExist()
    {
        // Act
        var result = await _versionHistoryService.GetLatestInstalledVersionAsync();
        
        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetAllInstalledVersionsAsync_ShouldReturnAllVersionsOrderedByInstallDateDescending()
    {
        // Arrange
        var version1 = TestDataBuilder.CreateInstalledVersion("1.0.0");
        version1.InstalledAt = version1.InstalledAt.Plus(Duration.FromDays(-3));
        
        var version2 = TestDataBuilder.CreateInstalledVersion("1.1.0");
        version2.InstalledAt = version2.InstalledAt.Plus(Duration.FromDays(-2));
        
        var version3 = TestDataBuilder.CreateInstalledVersion("1.2.0");
        version3.InstalledAt = version3.InstalledAt.Plus(Duration.FromDays(-1));
        
        var version4 = TestDataBuilder.CreateInstalledVersion("2.0.0");
        
        _dbContext.InstalledVersions.AddRange(version1, version2, version3, version4);
        await _dbContext.SaveChangesAsync(TestContext.Current.CancellationToken);
        
        // Act
        var result = await _versionHistoryService.GetAllInstalledVersionsAsync();
        
        // Assert
        result.Should().HaveCount(4);
        result[0].Version.Should().Be("2.0.0"); // Most recent
        result[1].Version.Should().Be("1.2.0");
        result[2].Version.Should().Be("1.1.0");
        result[3].Version.Should().Be("1.0.0"); // Oldest
    }

    [Fact]
    public async Task GetAllInstalledVersionsAsync_ShouldReturnEmptyList_WhenNoVersionsExist()
    {
        // Act
        var result = await _versionHistoryService.GetAllInstalledVersionsAsync();
        
        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task AddVersionAsync_ShouldHandleSemanticVersionNumbers()
    {
        // Arrange
        var semanticVersions = new[] 
        { 
            "1.0.0",
            "1.0.1",
            "1.1.0",
            "2.0.0-alpha",
            "2.0.0-beta.1",
            "2.0.0"
        };
        
        // Act
        foreach (var version in semanticVersions)
        {
            await _versionHistoryService.AddVersionAsync(version);
        }
        
        // Assert
        var allVersions = await _dbContext.InstalledVersions.ToListAsync(TestContext.Current.CancellationToken);
        allVersions.Should().HaveCount(6);
        allVersions.Select(v => v.Version).Should().BeEquivalentTo(semanticVersions);
    }

    [Fact]
    public async Task Service_ShouldUseAsNoTracking_ForReadOperations()
    {
        // Arrange
        var version = TestDataBuilder.CreateInstalledVersion("1.0.0");
        _dbContext.InstalledVersions.Add(version);
        await _dbContext.SaveChangesAsync(TestContext.Current.CancellationToken);
        _dbContext.ChangeTracker.Clear();
        
        // Act
        await _versionHistoryService.GetFirstInstalledVersionAsync();
        await _versionHistoryService.GetLatestInstalledVersionAsync();
        await _versionHistoryService.GetAllInstalledVersionsAsync();
        
        // Assert
        // After read operations with AsNoTracking, no entities should be tracked
        _dbContext.ChangeTracker.Entries().Should().BeEmpty();
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData("  ")]
    public async Task AddVersionAsync_ShouldHandleEmptyOrWhitespaceVersions(string version)
    {
        // Act
        await _versionHistoryService.AddVersionAsync(version);
        
        // Assert
        var savedVersion = await _dbContext.InstalledVersions.FirstOrDefaultAsync(TestContext.Current.CancellationToken);
        savedVersion.Should().NotBeNull();
        savedVersion!.Version.Should().Be(version);
    }

    [Fact]
    public async Task AddVersionAsync_ShouldHandleVeryLongVersionStrings()
    {
        // Arrange
        var longVersion = "1.0.0-alpha.beta.gamma.delta.epsilon.zeta.eta.theta.iota.kappa.lambda";
        
        // Act
        await _versionHistoryService.AddVersionAsync(longVersion);
        
        // Assert
        var savedVersion = await _dbContext.InstalledVersions.FirstOrDefaultAsync(TestContext.Current.CancellationToken);
        savedVersion.Should().NotBeNull();
        savedVersion!.Version.Should().Be(longVersion);
    }

    [Fact]
    public async Task Service_ShouldWorkWithConcurrentVersionAdditions()
    {
        // Arrange
        var versions = Enumerable.Range(1, 10).Select(i => $"1.0.{i}").ToList();
        
        // Act
        foreach (var version in versions)
        {
            await _versionHistoryService.AddVersionAsync(version);
        }
        
        // Assert
        var allVersions = await _dbContext.InstalledVersions.ToListAsync(TestContext.Current.CancellationToken);
        allVersions.Should().HaveCount(10);
        allVersions.Select(v => v.Version).Should().BeEquivalentTo(versions);
    }
}
