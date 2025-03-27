using Api.Data.Context;
using Api.Services;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Api.Endpoints.SystemInfo;

public static class SystemInfoEndpoints
{
    public static async Task<IResult> GetSystemStatusAsync(
        ApplicationContext dbContext,
        IApplicationInfoService infoService,
        IVersionHistoryService versionHistoryService)
    {
        var uptime = infoService.Uptime;

        var firstVersionInstalled = await versionHistoryService.GetFirstInstalledVersionAsync();
        var latestVersionInstalled = await versionHistoryService.GetLatestInstalledVersionAsync();

        await using var connection = new NpgsqlConnection(dbContext.Database.GetConnectionString());
        await connection.OpenAsync();
        var databaseVersion = connection.ServerVersion;

        return TypedResults.Ok(new
        {
            infoService.ApplicationVersion,
            infoService.BuildDate,
            databaseVersion,
            FirstVersionInstalled = firstVersionInstalled?.Version,
            FirstVersionInstalledAt = firstVersionInstalled?.InstalledAt.ToDateTimeUtc(),
            infoService.DotNetVersion,
            infoService.IsRunningOnDocker,
            LatestInstalledVersion = latestVersionInstalled?.Version,
            LatestVersionInstalledAt = latestVersionInstalled?.InstalledAt.ToDateTimeUtc(),
            LatestMigrationApplied = await infoService.GetLastMigrationNameAsync(dbContext),
            infoService.OsName,
            infoService.OsVersion,
            startDate = infoService.StartDate.ToDateTimeUtc(),
            uptime
        });
    }
}
