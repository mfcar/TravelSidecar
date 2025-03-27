using Api.Data.Context;
using Api.Data.Entities;
using Api.DTOs.Currencies;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace Api.Services;

public interface ICurrencyService
{
    Task<List<CurrencyResponse>> GetAllCurrenciesAsync(CancellationToken ct = default);
}

public class CurrencyService : ICurrencyService
{
    private readonly ApplicationContext _context;
    private readonly IMemoryCache _memoryCache;
    private readonly ILogger<CurrencyService> _logger;
    private const string CacheKey = "ALL_CURRENCIES_CACHE_KEY";
    private static readonly TimeSpan CacheDuration = TimeSpan.FromDays(1);

    public CurrencyService(
        ApplicationContext context,
        IMemoryCache memoryCache,
        ILogger<CurrencyService> logger)
    {
        _context = context;
        _memoryCache = memoryCache;
        _logger = logger;
    }

    public async Task<List<CurrencyResponse>> GetAllCurrenciesAsync(CancellationToken ct = default)
    {
        if (_memoryCache.TryGetValue(CacheKey, out List<CurrencyResponse> cachedCurrencies))
        {
            _logger.LogDebug("Retrieved {Count} currencies from cache", cachedCurrencies.Count);
            return cachedCurrencies;
        }

        var currencies = await LoadCurrenciesFromDatabaseAsync(ct);
        
        _memoryCache.Set(CacheKey, currencies, CacheDuration);
        
        _logger.LogInformation("Loaded {Count} currencies from database and cached them", currencies.Count);
        return currencies;
    }

    private async Task<List<CurrencyResponse>> LoadCurrenciesFromDatabaseAsync(CancellationToken ct = default)
    {
        return await _context.Set<Currency>()
            .AsNoTracking()
            .OrderBy(c => c.Code)
            .Select(c => new CurrencyResponse
            {
                Code = c.Code,
                EnglishName = c.EnglishName,
                CountryCode = c.CountryCode
            })
            .ToListAsync(ct);
    }
}
