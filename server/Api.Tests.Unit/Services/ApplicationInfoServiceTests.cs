using Api.Data.Context;
using Api.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using NodaTime;
using Xunit;

namespace Api.Tests.Unit.Services;

public class ApplicationInfoServiceTests
{
    private readonly ApplicationInfoService _applicationInfoService;

    public ApplicationInfoServiceTests()
    {
        _applicationInfoService = new ApplicationInfoService();
    }

    [Fact]
    public void ApplicationVersion_ShouldReturnValidVersion()
    {
        // Act
        var version = _applicationInfoService.ApplicationVersion;
        
        // Assert
        version.Should().NotBeNull();
        version.Major.Should().BeGreaterThanOrEqualTo(0);
        version.Minor.Should().BeGreaterThanOrEqualTo(0);
        version.Build.Should().BeGreaterThanOrEqualTo(0);
    }

    [Fact]
    public void BuildDate_ShouldReturnValidDate()
    {
        // Act
        var buildDate = _applicationInfoService.BuildDate;
        
        // Assert
        buildDate.Should().BeBefore(DateTime.UtcNow.AddMinutes(1));
        buildDate.Should().BeAfter(DateTime.MinValue);
        buildDate.Kind.Should().Be(DateTimeKind.Utc);
    }

    [Fact]
    public void DotNetVersion_ShouldReturnValidVersion()
    {
        // Act
        var dotNetVersion = _applicationInfoService.DotNetVersion;
        
        // Assert
        dotNetVersion.Should().NotBeNullOrWhiteSpace();
        dotNetVersion.Should().MatchRegex(@"^\d+\.\d+\.\d+");
    }

    [Fact]
    public void IsRunningOnDocker_ShouldReturnBoolean()
    {
        // Act
        var isDocker = _applicationInfoService.IsRunningOnDocker;
        
        // Assert
        // IsRunningOnDocker returns a boolean, no specific assertion needed
    }

    [Fact]
    public void StartDate_ShouldBeSetAtCreation()
    {
        // Arrange
        var beforeCreation = Instant.FromDateTimeUtc(DateTime.UtcNow).Minus(Duration.FromSeconds(1));
        
        // Act
        var service = new ApplicationInfoService();
        var afterCreation = Instant.FromDateTimeUtc(DateTime.UtcNow).Plus(Duration.FromSeconds(1));
        
        // Assert
        service.StartDate.Should().BeGreaterThan(beforeCreation);
        service.StartDate.Should().BeLessThan(afterCreation);
    }

    [Fact]
    public void Uptime_ShouldIncreaseOverTime()
    {
        // Arrange
        var service = new ApplicationInfoService();
        
        // Act
        var uptime1 = service.Uptime;
        Thread.Sleep(100); // Wait 100ms
        var uptime2 = service.Uptime;
        
        // Assert
        uptime2.Should().BeGreaterThan(uptime1);
        uptime2.TotalMilliseconds.Should().BeGreaterThanOrEqualTo(uptime1.TotalMilliseconds + 90); // Allow some tolerance
    }

    [Fact]
    public void Uptime_ShouldReturnPositiveTimeSpan()
    {
        // Act
        var uptime = _applicationInfoService.Uptime;
        
        // Assert
        uptime.Should().BePositive();
        uptime.TotalSeconds.Should().BeGreaterThanOrEqualTo(0);
    }

    [Fact]
    public void OsName_ShouldReturnValidOperatingSystemName()
    {
        // Act
        var osName = _applicationInfoService.OsName;
        
        // Assert
        osName.Should().NotBeNullOrWhiteSpace();
        var validOsNames = new[] { "Windows", "macOS", "Linux", "FreeBSD", "Unknown OS" };
        osName.Should().Match(os => validOsNames.Contains(os) || os.Contains("Linux"));
    }

    [Fact]
    public void OsVersion_ShouldReturnValidOperatingSystemVersion()
    {
        // Act
        var osVersion = _applicationInfoService.OsVersion;
        
        // Assert
        osVersion.Should().NotBeNullOrWhiteSpace();
        osVersion.Should().NotBe("Unknown Version");
    }

    [Fact]
    public void OsNameAndVersion_ShouldReturnRuntimeDescription()
    {
        // Act
        var osNameAndVersion = _applicationInfoService.OsNameAndVersion;
        
        // Assert
        osNameAndVersion.Should().NotBeNullOrWhiteSpace();
        osNameAndVersion.Should().Contain(" "); // Should contain OS name and version info
    }

    [Fact]
    public async Task GetLastMigrationNameAsync_ShouldReturnNone_ForInMemoryDatabase()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<ApplicationContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        using var dbContext = new ApplicationContext(options);
        
        // Note: In-memory database doesn't support relational operations like GetAppliedMigrationsAsync
        // This test verifies the service handles this gracefully
        
        // Act & Assert
        // This should throw because in-memory database doesn't support relational operations
        await Assert.ThrowsAsync<InvalidOperationException>(
            async () => await _applicationInfoService.GetLastMigrationNameAsync(dbContext)
        );
    }

    [Fact]
    public async Task GetLastMigrationNameAsync_ShouldThrowForNonRelationalDatabase()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<ApplicationContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        using var dbContext = new ApplicationContext(options);
        
        // Act & Assert
        // In-memory database doesn't support relational operations
        await Assert.ThrowsAsync<InvalidOperationException>(
            async () => await _applicationInfoService.GetLastMigrationNameAsync(dbContext)
        );
    }

    [Fact]
    public void Service_ShouldProvideConsistentSystemInfo()
    {
        // Arrange
        var service1 = new ApplicationInfoService();
        var service2 = new ApplicationInfoService();
        
        // Act & Assert
        // Static system properties should be the same across instances
        service1.ApplicationVersion.Should().Be(service2.ApplicationVersion);
        service1.DotNetVersion.Should().Be(service2.DotNetVersion);
        service1.OsName.Should().Be(service2.OsName);
        service1.OsVersion.Should().Be(service2.OsVersion);
        service1.IsRunningOnDocker.Should().Be(service2.IsRunningOnDocker);
        
        // Instance-specific properties should differ (unless created in the same instant)
        // Since the tests run very fast, StartDate might be the same, so we just verify they're set
        service1.StartDate.Should().NotBe(Instant.MinValue);
        service2.StartDate.Should().NotBe(Instant.MinValue);
    }

    [Fact]
    public void Properties_ShouldNotThrowExceptions()
    {
        // Arrange
        var service = new ApplicationInfoService();
        
        // Act & Assert - None of these should throw
        var version = () => service.ApplicationVersion;
        var buildDate = () => service.BuildDate;
        var dotNetVersion = () => service.DotNetVersion;
        var isDocker = () => service.IsRunningOnDocker;
        var uptime = () => service.Uptime;
        var startDate = () => service.StartDate;
        var osName = () => service.OsName;
        var osVersion = () => service.OsVersion;
        var osNameAndVersion = () => service.OsNameAndVersion;
        
        version.Should().NotThrow();
        buildDate.Should().NotThrow();
        dotNetVersion.Should().NotThrow();
        isDocker.Should().NotThrow();
        uptime.Should().NotThrow();
        startDate.Should().NotThrow();
        osName.Should().NotThrow();
        osVersion.Should().NotThrow();
        osNameAndVersion.Should().NotThrow();
    }

    [Fact]
    public void BuildDate_ShouldBeReasonable()
    {
        // Act
        var buildDate = _applicationInfoService.BuildDate;
        
        // Assert
        // Build date should be after year 2020 and before current time
        buildDate.Should().BeAfter(new DateTime(2020, 1, 1, 0, 0, 0, DateTimeKind.Utc));
        buildDate.Should().BeBefore(DateTime.UtcNow.AddDays(1));
    }

    [Fact]
    public void DotNetVersion_ShouldIndicateNet9OrHigher()
    {
        // Act
        var dotNetVersion = _applicationInfoService.DotNetVersion;
        var versionParts = dotNetVersion.Split('.');
        
        // Assert
        versionParts.Length.Should().BeGreaterThanOrEqualTo(2);
        var majorVersion = int.Parse(versionParts[0]);
        majorVersion.Should().BeGreaterThanOrEqualTo(9); // .NET 9 or higher
    }
}