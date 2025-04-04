using System.Text.Json;
using Api.Data.Context;
using Api.DTOs.Preferences;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using NodaTime;

namespace Api.Services;

public interface IUserPreferencesService
{
    Task<UserPreferencesDto> GetUserPreferencesAsync(Guid userId, CancellationToken ct = default);
    Task UpdateBasicPreferencesAsync(Guid userId, BasicUserPreferencesDto preferences, CancellationToken ct = default);
    Task UpdatePagePreferencesAsync(Guid userId, string pageKey, ListPagePreferencesDto pagePreferences, CancellationToken ct = default);
    Task UpdateBatchPagePreferencesAsync(Guid userId, Dictionary<string, ListPagePreferencesDto> pagePreferences, CancellationToken ct = default);
    Task CompleteInitialSetupAsync(Guid userId, CancellationToken ct = default);
    Task InvalidateCacheAsync(Guid userId);
}

public class UserPreferencesService : IUserPreferencesService
{
    private readonly ApplicationContext _context;
    private readonly IMemoryCache _memoryCache;
    private readonly ILogger<UserPreferencesService> _logger;
    
    private const string CacheKeyPrefix = "USER_PREFERENCES_";
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(30);
    
    public UserPreferencesService(
        ApplicationContext context,
        IMemoryCache memoryCache,
        ILogger<UserPreferencesService> logger)
    {
        _context = context;
        _memoryCache = memoryCache;
        _logger = logger;
    }
    
    public async Task<UserPreferencesDto> GetUserPreferencesAsync(Guid userId, CancellationToken ct = default)
    {
        var cacheKey = $"{CacheKeyPrefix}{userId}";
        
        if (_memoryCache.TryGetValue(cacheKey, out UserPreferencesDto cachedPreferences))
        {
            return cachedPreferences;
        }
        
        var user = await _context.ApplicationUsers
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId, ct);
            
        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID {userId} not found");
        }
        
        var preferences = new UserPreferencesDto
        {
            PreferredDateFormat = user.PreferredDateFormat,
            PreferredTimeFormat = user.PreferredTimeFormat,
            PreferredFirstDayOfWeek = user.PreferredFirstDayOfWeek,
            PreferredTimezone = user.PreferredTimezone,
            PreferredCurrencyCode = user.PreferredCurrencyCode,
            PreferredThemeMode = user.PreferredThemeMode,
            PreferredItemsPerPage = user.PreferredItemsPerPage,
            PreferredLanguage = user.PreferredLanguage,
            IsInitialSetupComplete = user.IsInitialSetupComplete,
            PagePreferences = DeserializePagePreferences(user.PagePreferences)
        };
        
        _memoryCache.Set(cacheKey, preferences, CacheDuration);
        
        return preferences;
    }

    public async Task UpdateBasicPreferencesAsync(Guid userId, BasicUserPreferencesDto preferences, CancellationToken ct = default)
    {
        var user = await _context.ApplicationUsers
            .FirstOrDefaultAsync(u => u.Id == userId, ct);
            
        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID {userId} not found");
        }
        
        if (preferences.PreferredDateFormat.HasValue)
            user.PreferredDateFormat = preferences.PreferredDateFormat.Value;
        
        if (preferences.PreferredTimeFormat.HasValue)
            user.PreferredTimeFormat = preferences.PreferredTimeFormat.Value;
        
        if (preferences.PreferredFirstDayOfWeek.HasValue)
            user.PreferredFirstDayOfWeek = preferences.PreferredFirstDayOfWeek.Value;
        
        if (preferences.PreferredTimezone != null)
            user.PreferredTimezone = preferences.PreferredTimezone;
            
        if (preferences.PreferredCurrencyCode != null)
            user.PreferredCurrencyCode = preferences.PreferredCurrencyCode;
            
        if (preferences.PreferredThemeMode.HasValue)
            user.PreferredThemeMode = preferences.PreferredThemeMode.Value;
            
        if (preferences.PreferredItemsPerPage.HasValue)
            user.PreferredItemsPerPage = preferences.PreferredItemsPerPage.Value;
            
        if (preferences.PreferredLanguage != null)
            user.PreferredLanguage = preferences.PreferredLanguage;
        
        user.LastModifiedAt = Instant.FromDateTimeUtc(DateTime.UtcNow);
        
        await _context.SaveChangesAsync(ct);
        await InvalidateCacheAsync(userId);
    }

    public async Task UpdatePagePreferencesAsync(Guid userId, string pageKey, ListPagePreferencesDto pagePreferences, CancellationToken ct = default)
    {
        var user = await _context.ApplicationUsers
            .FirstOrDefaultAsync(u => u.Id == userId, ct);
            
        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID {userId} not found");
        }
        
        var allPagePreferences = DeserializePagePreferences(user.PagePreferences);
        
        allPagePreferences[pageKey] = pagePreferences;
        
        user.PagePreferences = JsonSerializer.Serialize(allPagePreferences);
        user.LastModifiedAt = Instant.FromDateTimeUtc(DateTime.UtcNow);
        
        await _context.SaveChangesAsync(ct);
        await InvalidateCacheAsync(userId);
    }

    public async Task UpdateBatchPagePreferencesAsync(Guid userId, Dictionary<string, ListPagePreferencesDto> pagePreferences, CancellationToken ct = default)
    {
        var user = await _context.ApplicationUsers
            .FirstOrDefaultAsync(u => u.Id == userId, ct);
            
        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID {userId} not found");
        }
        
        var allPagePreferences = DeserializePagePreferences(user.PagePreferences);
        
        foreach (var (key, value) in pagePreferences)
        {
            allPagePreferences[key] = value;
        }
        
        user.PagePreferences = JsonSerializer.Serialize(allPagePreferences);
        user.LastModifiedAt = Instant.FromDateTimeUtc(DateTime.UtcNow);
        
        await _context.SaveChangesAsync(ct);
        await InvalidateCacheAsync(userId);
    }

    public async Task CompleteInitialSetupAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _context.ApplicationUsers
            .FirstOrDefaultAsync(u => u.Id == userId, ct);
            
        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID {userId} not found");
        }
        
        user.IsInitialSetupComplete = true;
        user.LastModifiedAt = Instant.FromDateTimeUtc(DateTime.UtcNow);
        
        await _context.SaveChangesAsync(ct);
        await InvalidateCacheAsync(userId);
    }

    public Task InvalidateCacheAsync(Guid userId)
    {
        var cacheKey = $"{CacheKeyPrefix}{userId}";
        _memoryCache.Remove(cacheKey);
        return Task.CompletedTask;
    }

    private Dictionary<string, ListPagePreferencesDto> DeserializePagePreferences(string? jsonPreferences)
    {
        if (string.IsNullOrEmpty(jsonPreferences))
        {
            return new Dictionary<string, ListPagePreferencesDto>();
        }
        
        try
        {
            return JsonSerializer.Deserialize<Dictionary<string, ListPagePreferencesDto>>(jsonPreferences) 
                   ?? new Dictionary<string, ListPagePreferencesDto>();
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Error deserializing page preferences: {Message}", ex.Message);
            return new Dictionary<string, ListPagePreferencesDto>();
        }
    }
}
