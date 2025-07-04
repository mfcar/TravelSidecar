using System.Text.Json;
using Api.DTOs.Config;
using Api.Services.Health;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;

namespace Api.Extensions;

public static class HealthCheckExtensions
{
    private static readonly string[] Tags = ["ready", "app"];

    public static void AddApplicationHealthChecks(this IServiceCollection services)
    {
        services.Configure<MemoryHealthCheckOptions>(options =>
        {
            options.WarningThresholdMb = 768;
            options.CriticalThresholdMb = 896;
        });

        services.AddHealthChecks()
            .AddCheck("self", () => HealthCheckResult.Healthy(), tags: ["live"])
            .AddNpgSql(
                connectionStringFactory: sp =>
                {
                    var dbConfig = sp.GetRequiredService<IOptions<DatabaseConfiguration>>().Value;

                    var host = Environment.GetEnvironmentVariable("DB_HOST") ?? dbConfig.Host;
                    var port = Environment.GetEnvironmentVariable("DB_PORT") != null
                        ? int.Parse(Environment.GetEnvironmentVariable("DB_PORT")!)
                        : dbConfig.Port;
                    var database = Environment.GetEnvironmentVariable("DB_NAME") ?? dbConfig.Name;
                    var username = Environment.GetEnvironmentVariable("DB_USER") ?? dbConfig.User;
                    var password = Environment.GetEnvironmentVariable("DB_PASSWORD") ?? dbConfig.Password;

                    return $"Server={host};Port={port};Database={database};Username={username};Password={password};";
                },
                name: "postgres-connection",
                failureStatus: HealthStatus.Degraded,
                tags: ["ready", "db"])
            .AddCheck<ApplicationHealthCheckService>("application-health",
                tags: Tags)
            .AddCheck<MemoryHealthCheckService>("memory",
                failureStatus: HealthStatus.Degraded,
                tags: ["monitoring", "resource"])
            .AddCheck<StorageHealthCheckService>("storage",
                failureStatus: HealthStatus.Degraded,
                tags: ["ready", "storage"]);
    }

    public static void MapHealthCheckEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapHealthChecks("/health/live", new HealthCheckOptions
        {
            Predicate = check => check.Tags.Contains("live"),
            ResponseWriter = WriteHealthCheckResponse
        }).AllowAnonymous().WithTags("Health Checks");

        endpoints.MapHealthChecks("/health/ready", new HealthCheckOptions
        {
            Predicate = check => check.Tags.Contains("ready"),
            ResponseWriter = WriteHealthCheckResponse
        }).AllowAnonymous().WithTags("Health Checks");
        
        endpoints.MapHealthChecks("/health/resources", new HealthCheckOptions
        {
            Predicate = check => check.Tags.Contains("resource") || check.Tags.Contains("monitoring"),
            ResponseWriter = WriteHealthCheckResponse
        }).AllowAnonymous().WithTags("Health Checks");
    }

    private static Task WriteHealthCheckResponse(HttpContext context, HealthReport report)
    {
        context.Response.ContentType = "application/json; charset=utf-8";

        var options = new JsonWriterOptions { Indented = false };

        using var memoryStream = new MemoryStream();
        using (var jsonWriter = new Utf8JsonWriter(memoryStream, options))
        {
            jsonWriter.WriteStartObject();
            jsonWriter.WriteString("status", report.Status.ToString());
            jsonWriter.WriteNumber("totalDuration (ms)", report.TotalDuration.TotalMilliseconds);

            jsonWriter.WriteStartObject("checks");
            foreach (var (key, entry) in report.Entries)
            {
                jsonWriter.WriteStartObject(key);
                jsonWriter.WriteString("status", entry.Status.ToString());
                jsonWriter.WriteNumber("duration (ms)", entry.Duration.TotalMilliseconds);

                if (entry.Description != null)
                {
                    jsonWriter.WriteString("description", entry.Description);
                }

                if (entry.Exception != null)
                {
                    jsonWriter.WriteString("error", entry.Exception.Message);
                }

                if (entry.Data.Count > 0)
                {
                    jsonWriter.WriteStartObject("data");
                    foreach (var (dataKey, value) in entry.Data)
                    {
                        jsonWriter.WritePropertyName(dataKey);
                        JsonSerializer.Serialize(jsonWriter, value);
                    }

                    jsonWriter.WriteEndObject();
                }

                jsonWriter.WriteEndObject();
            }

            jsonWriter.WriteEndObject();

            jsonWriter.WriteEndObject();
        }

        return context.Response.WriteAsync(
            System.Text.Encoding.UTF8.GetString(memoryStream.ToArray()));
    }
}
