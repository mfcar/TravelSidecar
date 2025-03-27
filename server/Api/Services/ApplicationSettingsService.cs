using System.Text.Json;
using Api.Data.Context;
using Api.Data.Entities;
using Api.Enums;
using Api.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace Api.Services;

public interface IApplicationSettingsService
{
    Task<T> GetApplicationSettingAsync<T>(SettingKey key);
    Task UpdateApplicationSettingAsync(SettingKey key, object value);
}

public class ApplicationSettingsService(ApplicationContext dbContext, IMemoryCache cache) : IApplicationSettingsService
{
    private const string CacheKeyPrefix = "ApplicationSetting_";
    private static readonly TimeSpan CacheExpirationInMinutes = TimeSpan.FromMinutes(360);

    private static readonly Func<ApplicationContext, SettingKey, Task<ApplicationSetting?>> GetSettingCompiledQuery =
        EF.CompileAsyncQuery((ApplicationContext context, SettingKey key) =>
            context.ApplicationSettings.AsNoTracking().FirstOrDefault(s => s.Key == key)
        );

    public async Task<T> GetApplicationSettingAsync<T>(SettingKey key)
    {
        var cacheKey = $"{CacheKeyPrefix}{key}";

        if (cache.TryGetValue(cacheKey, out T? rawValue)) return rawValue!;

        var setting = await GetSettingCompiledQuery(dbContext, key);
        if (setting == null)
        {
            throw new KeyNotFoundException($"Application Setting with key {key} not found to be retrieved.");
        }

        rawValue = JsonSerializer.Deserialize<T>(setting.Value);
        cache.Set(cacheKey, rawValue, CacheExpirationInMinutes);

        return rawValue!;
    }

    public async Task UpdateApplicationSettingAsync(SettingKey key, object value)
    {
        if (!DefaultSettings.ValidateSetting(key, value))
        {
            throw new ArgumentException($"Invalid value for setting {key}");
        }
        
        var setting = await dbContext.ApplicationSettings
            .FirstOrDefaultAsync(s => s.Key == key);

        if (setting is null)
        {
            throw new KeyNotFoundException($"Application Setting with key {key} not found to be updated.");
        }

        setting.Value = DefaultSettings.SerializeValue(value);

        dbContext.ApplicationSettings.Update(setting);
        await dbContext.SaveChangesAsync();

        cache.Remove($"{CacheKeyPrefix}{key}");
    }
}