using Api.Data.Context;
using Api.Data.Entities;
using Api.Extensions;
using Microsoft.EntityFrameworkCore;

namespace Api.Data.Seeds;

public class DefaultSettingsSeed : IDataSeed
{
    private readonly ApplicationContext _dbContext;
    private readonly ILogger<DefaultSettingsSeed> _logger;

    public DefaultSettingsSeed(ApplicationContext dbContext, ILogger<DefaultSettingsSeed> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        var existingKeys = await _dbContext.ApplicationSettings
            .AsNoTracking()
            .Select(s => s.Key)
            .ToListAsync();

        var newSettings = DefaultSettings.Defaults
            .Where(kv => !existingKeys.Contains(kv.Key))
            .Select(kv => new ApplicationSetting
            {
                Key = kv.Key,
                Value = DefaultSettings.GetCachedSettingValue(kv.Key)!
            })
            .ToList();

        if (newSettings.Count != 0)
        {
            _dbContext.ApplicationSettings.AddRange(newSettings);
            await _dbContext.SaveChangesAsync();

            foreach (var setting in newSettings)
            {
                _logger.LogInformation("Seeding default setting: {Key} = {Value}", setting.Key, setting.Value);
            }
        }
        else
        {
            _logger.LogInformation("All default settings are already seeded");
        }
    }
}
