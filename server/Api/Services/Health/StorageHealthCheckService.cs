using System.Diagnostics;
using Api.Services.Files;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Api.Services.Health;

public class StorageHealthCheckService : IHealthCheck
{
    private readonly IFileStorageService _fileStorageService;
    private readonly ILogger<StorageHealthCheckService> _logger;

    public StorageHealthCheckService(
        IFileStorageService fileStorageService,
        ILogger<StorageHealthCheckService> logger)
    {
        _fileStorageService = fileStorageService;
        _logger = logger;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            var stopwatch = Stopwatch.StartNew();
            var bucketExists = await _fileStorageService.EnsureBucketExistsAsync();
            stopwatch.Stop();

            if (!bucketExists)
            {
                return HealthCheckResult.Unhealthy(
                    "Storage bucket doesn't exist or couldn't be created",
                    data: new Dictionary<string, object> { ["responseTime (ms)"] = stopwatch.ElapsedMilliseconds });
            }

            return HealthCheckResult.Healthy(
                "Storage service is healthy",
                data: new Dictionary<string, object> { ["responseTime (ms)"] = stopwatch.ElapsedMilliseconds });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Health check failed for storage service");
            return HealthCheckResult.Unhealthy(
                "Storage service check failed",
                ex,
                data: new Dictionary<string, object> { ["errorMessage"] = ex.Message });
        }
    }
}
