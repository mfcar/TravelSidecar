using Api.Services;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using NodaTime;
using NSubstitute;
using Xunit;

namespace Api.Tests.Unit.Services;

public class LifecycleServiceTests
{
    private readonly ILogger<LifecycleService> _logger;
    private readonly IApplicationInfoService _applicationInfoService;
    private readonly LifecycleService _sut;

    public LifecycleServiceTests()
    {
        _logger = Substitute.For<ILogger<LifecycleService>>();
        _applicationInfoService = Substitute.For<IApplicationInfoService>();
        _sut = new LifecycleService(_logger, _applicationInfoService);
    }

    [Fact]
    public async Task StartAsync_ShouldLogApplicationInformation()
    {
        // Arrange
        var version = new Version(1, 2, 3, 4);
        var buildDate = new DateTime(2024, 1, 15, 10, 30, 0, DateTimeKind.Utc);

        _applicationInfoService.ApplicationVersion.Returns(version);
        _applicationInfoService.BuildDate.Returns(buildDate);
        _applicationInfoService.DotNetVersion.Returns("8.0.100");
        _applicationInfoService.IsRunningOnDocker.Returns(true);

        // Act
        await _sut.StartAsync(TestContext.Current.CancellationToken);

        // Assert
        _logger.Received(1).Log(
            LogLevel.Information,
            Arg.Any<EventId>(),
            Arg.Is<object>(v => v.ToString().Contains("TravelSidecar Server - v1.2.3.4")),
            null,
            Arg.Any<Func<object, Exception?, string>>());

        _logger.Received(1).Log(
            LogLevel.Information,
            Arg.Any<EventId>(),
            Arg.Is<object>(v => v.ToString().Contains("Build Date:")),
            null,
            Arg.Any<Func<object, Exception?, string>>());

        _logger.Received(1).Log(
            LogLevel.Information,
            Arg.Any<EventId>(),
            Arg.Is<object>(v => v.ToString().Contains(".NET Version: 8.0.100")),
            null,
            Arg.Any<Func<object, Exception?, string>>());

        _logger.Received(1).Log(
            LogLevel.Information,
            Arg.Any<EventId>(),
            Arg.Is<object>(v => v.ToString().Contains("Running on Docker: True")),
            null,
            Arg.Any<Func<object, Exception?, string>>());

        _logger.Received(1).Log(
            LogLevel.Information,
            Arg.Any<EventId>(),
            Arg.Is<object>(v => v.ToString().Contains("Application started successfully")),
            null,
            Arg.Any<Func<object, Exception?, string>>());
    }

    [Fact]
    public async Task StartAsync_ShouldHandleZeroVersion()
    {
        // Arrange
        _applicationInfoService.ApplicationVersion.Returns(new Version(0, 0, 0));
        _applicationInfoService.BuildDate.Returns(DateTime.UtcNow);
        _applicationInfoService.DotNetVersion.Returns("8.0.0");
        _applicationInfoService.IsRunningOnDocker.Returns(false);
        _applicationInfoService.StartDate.Returns(Instant.FromDateTimeUtc(DateTime.UtcNow));
        _applicationInfoService.OsName.Returns("macOS");
        _applicationInfoService.OsVersion.Returns("macOS 14.0");

        // Act
        await _sut.StartAsync(TestContext.Current.CancellationToken);

        // Assert
        _logger.Received(1).Log(
            LogLevel.Information,
            Arg.Any<EventId>(),
            Arg.Is<object>(v => v.ToString().Contains("TravelSidecar Server - v0.0.0")),
            null,
            Arg.Any<Func<object, Exception?, string>>());
    }

    [Fact]
    public async Task StopAsync_ShouldLogShutdownMessage()
    {
        // Act
        await _sut.StopAsync(TestContext.Current.CancellationToken);

        // Assert
        await _sut.Invoking(s => s.StopAsync(TestContext.Current.CancellationToken))
            .Should().NotThrowAsync();
    }

    [Fact]
    public async Task StartAsync_ShouldHandleCancellation()
    {
        // Arrange
        var cts = new CancellationTokenSource();
        cts.Cancel();
        
        _applicationInfoService.ApplicationVersion.Returns(new Version(1, 0, 0));
        _applicationInfoService.BuildDate.Returns(DateTime.UtcNow);
        _applicationInfoService.DotNetVersion.Returns("8.0.0");
        _applicationInfoService.IsRunningOnDocker.Returns(false);
        _applicationInfoService.StartDate.Returns(Instant.FromDateTimeUtc(DateTime.UtcNow));
        _applicationInfoService.OsName.Returns("Linux");
        _applicationInfoService.OsVersion.Returns("Ubuntu 22.04");

        // Act & Assert
        await _sut.Invoking(s => s.StartAsync(cts.Token))
            .Should().NotThrowAsync();
    }

    [Fact]
    public async Task StopAsync_ShouldHandleCancellation()
    {
        // Arrange
        var cts = new CancellationTokenSource();
        cts.Cancel();

        // Act & Assert
        await _sut.Invoking(s => s.StopAsync(cts.Token))
            .Should().NotThrowAsync();
    }
}
