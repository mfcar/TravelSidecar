namespace Api.Services;

public class LifecycleService(ILogger<LifecycleService> logger, IApplicationInfoService appInfoService)
    : IHostedService
{
    public Task StartAsync(CancellationToken cancellationToken)
    {
        logger.LogInformation("TravelSidecar Server - v{Version}", appInfoService.ApplicationVersion);
        logger.LogInformation("Build Date: {BuildDate}", appInfoService.BuildDate);
        logger.LogInformation(".NET Version: {DotNetVersion}", appInfoService.DotNetVersion);
        logger.LogInformation("Running on Docker: {IsRunningOnDocker}", appInfoService.IsRunningOnDocker);
        logger.LogInformation("Application started successfully");

        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        Console.WriteLine("Shutting down the server...");

        return Task.CompletedTask;
    }
}
