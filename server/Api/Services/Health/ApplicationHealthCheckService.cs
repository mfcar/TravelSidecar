using Api.Data.Context;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Api.Services.Health;

public class ApplicationHealthCheckService : IHealthCheck
{
    private readonly ApplicationContext _dbContext;

    public ApplicationHealthCheckService(
        ApplicationContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context, 
        CancellationToken cancellationToken = default)
    {
        var isDbHealthy = await CheckDatabaseHealthAsync(cancellationToken);

        return isDbHealthy ? HealthCheckResult.Healthy("Application is healthy") : HealthCheckResult.Degraded("Database connectivity issues", null);
    }

    private async Task<bool> CheckDatabaseHealthAsync(CancellationToken cancellationToken)
    {
        try
        {
            return await _dbContext.Database.CanConnectAsync(cancellationToken);
        }
        catch
        {
            return false;
        }
    }
}
