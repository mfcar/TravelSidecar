using Api.Data.Context;
using Api.Data.Entities;
using Api.Data.Seeds;
using Api.DTOs.Config;
using Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Api.Extensions;

public static class DatabaseExtensions
{
    /// <summary>
    /// Adds the database context to the service collection
    /// </summary>
    public static void AddDatabase(this IServiceCollection services)
    {
        services.AddDbContext<ApplicationContext>((serviceProvider, options) =>
        {
            var dbConfig = serviceProvider.GetRequiredService<IOptions<DatabaseConfiguration>>().Value;

            var host = Environment.GetEnvironmentVariable("DB_HOST") ?? dbConfig.Host;
            var port = Environment.GetEnvironmentVariable("DB_PORT") != null
                ? int.Parse(Environment.GetEnvironmentVariable("DB_PORT")!)
                : dbConfig.Port;
            var database = Environment.GetEnvironmentVariable("DB_NAME") ?? dbConfig.Name;
            var username = Environment.GetEnvironmentVariable("DB_USER") ?? dbConfig.User;
            var password = Environment.GetEnvironmentVariable("DB_PASSWORD") ?? dbConfig.Password;

            var connectionString = $"Server={host};" +
                                   $"Port={port};" +
                                   $"Database={database};" +
                                   $"Username={username};" +
                                   $"Password={password};" +
                                   $"Persist Security Info=True;" +
                                   $"Include Error Detail={dbConfig.ErrorDetails.ToString().ToLowerInvariant()};";

            var logger = serviceProvider.GetService<ILogger<ApplicationContext>>();
            logger?.LogInformation("Connecting to database at {Host}:{Port}", host, port);

            options.UseNpgsql(connectionString, x =>
            {
                x.UseNetTopologySuite();
                x.UseNodaTime();
            });
        });
    }


    /// <summary>
    /// Ensures that the database is up-to-date by applying any pending migrations and seeding it with default settings.
    /// </summary>
    public static async Task EnsureDatabaseMigratedAndSeededAsync(this IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationContext>();
        var versionService = scope.ServiceProvider.GetRequiredService<IVersionHistoryService>();
        var applicationInfoService = scope.ServiceProvider.GetRequiredService<IApplicationInfoService>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<ApplicationRole>>();

        try
        {
            logger.LogInformation("Checking database migrations...");

            var pendingMigrations = (await dbContext.Database.GetPendingMigrationsAsync()).ToList();

            if (pendingMigrations.Count > 0)
            {
                logger.LogInformation("Applying {MigrationCount} pending migrations...", pendingMigrations.Count);
                await dbContext.Database.MigrateAsync();
                logger.LogInformation("Database migrations applied successfully");
            }
            else
            {
                logger.LogInformation("Database is up to date. No migrations required");
            }

            
            await new DefaultSettingsSeed(dbContext, 
                scope.ServiceProvider.GetRequiredService<ILogger<DefaultSettingsSeed>>()).SeedAsync();
            
            await new DefaultAdminUserSeed(
                scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>(),
                scope.ServiceProvider.GetRequiredService<RoleManager<ApplicationRole>>(),
                scope.ServiceProvider.GetRequiredService<ILogger<DefaultAdminUserSeed>>()).SeedAsync();
            
            await new DefaultCurrenciesSeed(dbContext, 
                scope.ServiceProvider.GetRequiredService<ILogger<DefaultCurrenciesSeed>>()).SeedAsync();
            await versionService.AddVersionAsync(applicationInfoService.ApplicationVersion.ToString());
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while checking or applying database migrations");
            throw;
        }
    }
}
