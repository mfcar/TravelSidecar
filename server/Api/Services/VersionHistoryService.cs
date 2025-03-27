using Api.Data.Context;
using Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Api.Services;

public interface IVersionHistoryService
{
    Task AddVersionAsync(string version);
    Task<InstalledVersion?> GetFirstInstalledVersionAsync();
    Task<InstalledVersion?> GetLatestInstalledVersionAsync();
    Task<List<InstalledVersion>> GetAllInstalledVersionsAsync();
}

public class VersionHistoryService(ApplicationContext dbContext, ILogger<VersionHistoryService> logger) : IVersionHistoryService
{
    public async Task AddVersionAsync(string version)
    {
        var existing = await dbContext.InstalledVersions
            .AsNoTracking()
            .Where(iv => iv.Version == version)
            .FirstOrDefaultAsync();

        if (existing == null)
        {
            dbContext.InstalledVersions.Add(new InstalledVersion { Version = version });
            await dbContext.SaveChangesAsync();
            logger.LogInformation("Added version {Version} to the version history", version);
        }
        else
        {
            logger.LogWarning("Version {Version} already exists in the version history", version);
        }
    }
    
    public async Task<InstalledVersion?> GetFirstInstalledVersionAsync()
    {
        return await dbContext.InstalledVersions
            .AsNoTracking()
            .OrderBy(iv => iv.InstalledAt)
            .FirstOrDefaultAsync();
    }
    
    public async Task<InstalledVersion?> GetLatestInstalledVersionAsync()
    {
        return await dbContext.InstalledVersions
            .AsNoTracking()
            .OrderByDescending(iv => iv.InstalledAt)
            .FirstOrDefaultAsync();
    }
    
    public async Task<List<InstalledVersion>> GetAllInstalledVersionsAsync()
    {
        return await dbContext.InstalledVersions
            .AsNoTracking()
            .OrderByDescending(iv => iv.InstalledAt)
            .ToListAsync();
    }
}