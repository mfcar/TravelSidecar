using System.Diagnostics;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;

namespace Api.Services.Health;

public class MemoryHealthCheckOptions
{
    /// <summary>
    /// Memory usage threshold in MB that will report as degraded
    /// </summary>
    public long WarningThresholdMb { get; set; } = 768;  // 768MB

    /// <summary>
    /// Memory usage threshold in MB that will report as unhealthy
    /// </summary>
    public long CriticalThresholdMb { get; set; } = 896;  // 896MB
}

public class MemoryHealthCheckService : IHealthCheck
{
    private readonly MemoryHealthCheckOptions _options;

    public MemoryHealthCheckService(IOptions<MemoryHealthCheckOptions> options)
    {
        _options = options.Value;
    }

    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context, 
        CancellationToken cancellationToken = default)
    {
        var usedMemoryMb = Process.GetCurrentProcess().WorkingSet64 / 1024 / 1024;
        
        var data = new Dictionary<string, object>
        {
            { "usedMemoryMb", usedMemoryMb },
            { "warningThresholdMb", _options.WarningThresholdMb },
            { "criticalThresholdMb", _options.CriticalThresholdMb }
        };

        if (usedMemoryMb >= _options.CriticalThresholdMb)
        {
            return Task.FromResult(
                HealthCheckResult.Unhealthy(
                    $"Critical memory usage: {usedMemoryMb}MB", null, data));
        }

        if (usedMemoryMb >= _options.WarningThresholdMb)
        {
            return Task.FromResult(
                HealthCheckResult.Degraded(
                    $"High memory usage: {usedMemoryMb}MB", null, data));
        }

        return Task.FromResult(
            HealthCheckResult.Healthy($"Memory usage: {usedMemoryMb}MB", data));
    }
}
