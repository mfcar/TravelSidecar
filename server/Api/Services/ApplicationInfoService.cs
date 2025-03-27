using System.Reflection;
using System.Runtime.InteropServices;
using Api.Data.Context;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Api.Services;

public interface IApplicationInfoService
{
    Version ApplicationVersion { get; }
    DateTime BuildDate { get; }
    string DotNetVersion { get; }
    bool IsRunningOnDocker { get; }
    TimeSpan Uptime { get; }
    Instant StartDate { get; }
    string OsName { get; }
    string OsVersion { get; }
    Task<string> GetLastMigrationNameAsync(ApplicationContext dbContext);
}

public class ApplicationInfoService : IApplicationInfoService
{
    public Instant StartDate { get; } = Instant.FromDateTimeUtc(DateTime.UtcNow);

    public Version ApplicationVersion => Assembly.GetExecutingAssembly().GetName().Version ?? new Version(0,0,0);
    
    public DateTime BuildDate => new FileInfo(Assembly.GetExecutingAssembly().Location).LastWriteTimeUtc;

    public string DotNetVersion => Environment.Version.ToString();

    public bool IsRunningOnDocker => File.Exists("/.dockerenv") ||
                                     (File.Exists("/proc/1/cgroup") &&
                                      File.ReadAllText("/proc/1/cgroup").Contains("docker"));
    
    public string OsNameAndVersion => RuntimeInformation.OSDescription;

    public TimeSpan Uptime
    {
        get
        {
            var now = SystemClock.Instance.GetCurrentInstant();
            var duration = now - StartDate;
            return duration.ToTimeSpan();
        }
    }

    public async Task<string> GetLastMigrationNameAsync(ApplicationContext dbContext)
    {
        var appliedMigrations = await dbContext.Database.GetAppliedMigrationsAsync();
        return appliedMigrations.LastOrDefault() ?? "None";
    }

    public string OsName => GetOsName();
    public string OsVersion => GetOsVersion();

    private string GetOsName()
    {
        if (OperatingSystem.IsWindows())
            return "Windows";

        if (OperatingSystem.IsMacOS())
            return "macOS";

        if (OperatingSystem.IsLinux())
        {
            var linuxDistroName = GetLinuxDistroName();
            return !string.IsNullOrEmpty(linuxDistroName) ? linuxDistroName : "Linux";
        }

        if (OperatingSystem.IsFreeBSD())
            return "FreeBSD";

        return "Unknown OS";
    }

    private string GetOsVersion()
    {
        if (OperatingSystem.IsWindows() || OperatingSystem.IsMacOS() || OperatingSystem.IsLinux())
        {
            return RuntimeInformation.OSDescription;
        }

        return "Unknown Version";
    }

    private string? GetLinuxDistroName()
    {
        try
        {
            if (File.Exists("/etc/os-release"))
            {
                var lines = File.ReadAllLines("/etc/os-release");
                foreach (var line in lines)
                {
                    if (!line.StartsWith("PRETTY_NAME=", StringComparison.OrdinalIgnoreCase)) continue;
                    
                    var prettyName = line.Split('=')[1].Trim('"');
                    return prettyName;
                }
            }
        }
        catch
        {
        }

        return null;
    }
}
