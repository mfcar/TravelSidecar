using Api.Data.Context;
using Api.Data.Entities;
using Api.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Xunit;

namespace Api.Tests.Unit.Services;

public class CurrencyServiceTests : IDisposable
{
    private readonly ApplicationContext _context;
    private readonly IMemoryCache _memoryCache;
    private readonly ILogger<CurrencyService> _logger;
    private readonly CurrencyService _sut;

    public CurrencyServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _context = new ApplicationContext(options);
        _memoryCache = new MemoryCache(new MemoryCacheOptions());
        _logger = Substitute.For<ILogger<CurrencyService>>();
        _sut = new CurrencyService(_context, _memoryCache, _logger);
    }

    public void Dispose()
    {
        _context.Dispose();
        _memoryCache.Dispose();
    }

    [Fact]
    public async Task GetAllCurrenciesAsync_ShouldReturnCachedData_WhenCacheIsPopulated()
    {
        // Arrange
        var cachedCurrencies = new List<DTOs.Currencies.CurrencyResponse>
        {
            new() { Code = "USD", EnglishName = "US Dollar", CountryCode = "US" },
            new() { Code = "EUR", EnglishName = "Euro", CountryCode = null }
        };
        _memoryCache.Set("ALL_CURRENCIES_CACHE_KEY", cachedCurrencies);

        // Act
        var result = await _sut.GetAllCurrenciesAsync(TestContext.Current.CancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result[0].Code.Should().Be("USD");
        result[1].Code.Should().Be("EUR");
    }

    [Fact]
    public async Task GetAllCurrenciesAsync_ShouldLoadFromDatabase_WhenCacheIsEmpty()
    {
        // Arrange
        var currencies = CreateTestCurrencies();
        _context.Set<Currency>().AddRange(currencies);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var result = await _sut.GetAllCurrenciesAsync(TestContext.Current.CancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(4);
        result.Should().BeInAscendingOrder(c => c.Code);
        result[0].Code.Should().Be("EUR");
        result[1].Code.Should().Be("GBP");
        result[2].Code.Should().Be("JPY");
        result[3].Code.Should().Be("USD");
    }

    [Fact]
    public async Task GetAllCurrenciesAsync_ShouldCacheDataAfterLoadingFromDatabase()
    {
        // Arrange
        var currencies = CreateTestCurrencies();
        _context.Set<Currency>().AddRange(currencies);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var firstCall = await _sut.GetAllCurrenciesAsync(TestContext.Current.CancellationToken);
        
        // Clear the database to ensure second call uses cache
        _context.Set<Currency>().RemoveRange(_context.Set<Currency>());
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);
        
        var secondCall = await _sut.GetAllCurrenciesAsync(TestContext.Current.CancellationToken);

        // Assert
        firstCall.Should().HaveCount(4);
        secondCall.Should().HaveCount(4);
        secondCall.Should().BeEquivalentTo(firstCall);
    }

    [Fact]
    public async Task GetAllCurrenciesAsync_ShouldReturnEmptyList_WhenNoCurrenciesInDatabase()
    {
        // Act
        var result = await _sut.GetAllCurrenciesAsync(TestContext.Current.CancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAllCurrenciesAsync_ShouldHandleNullCountryCode()
    {
        // Arrange
        var currency = new Currency
        {
            Code = "BTC",
            EnglishName = "Bitcoin",
            CountryCode = null
        };
        _context.Set<Currency>().Add(currency);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var result = await _sut.GetAllCurrenciesAsync(TestContext.Current.CancellationToken);

        // Assert
        result.Should().HaveCount(1);
        result[0].Code.Should().Be("BTC");
        result[0].CountryCode.Should().BeNull();
    }

    [Fact]
    public async Task GetAllCurrenciesAsync_ShouldHandleConcurrentRequests()
    {
        // Arrange
        var currencies = CreateTestCurrencies();
        _context.Set<Currency>().AddRange(currencies);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var tasks = new List<Task<List<DTOs.Currencies.CurrencyResponse>>>();
        for (int i = 0; i < 10; i++)
        {
            tasks.Add(_sut.GetAllCurrenciesAsync(TestContext.Current.CancellationToken));
        }
        var results = await Task.WhenAll(tasks);

        // Assert
        results.Should().HaveCount(10);
        results.Should().AllSatisfy(r =>
        {
            r.Should().HaveCount(4);
            r.Should().BeInAscendingOrder(c => c.Code);
        });
    }

    [Fact]
    public async Task GetAllCurrenciesAsync_ShouldCorrectlyMapEntityToDto()
    {
        // Arrange
        var currency = new Currency
        {
            Code = "CHF",
            EnglishName = "Swiss Franc",
            CountryCode = "CH"
        };
        _context.Set<Currency>().Add(currency);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var result = await _sut.GetAllCurrenciesAsync(TestContext.Current.CancellationToken);

        // Assert
        result.Should().HaveCount(1);
        var dto = result[0];
        dto.Code.Should().Be(currency.Code);
        dto.EnglishName.Should().Be(currency.EnglishName);
        dto.CountryCode.Should().Be(currency.CountryCode);
    }

    [Theory]
    [InlineData("A")]
    [InlineData("AB")]
    [InlineData("ABC")]
    public async Task GetAllCurrenciesAsync_ShouldHandleVariousCurrencyCodeLengths(string code)
    {
        // Arrange
        var currency = new Currency
        {
            Code = code,
            EnglishName = "Test Currency",
            CountryCode = "TC"
        };
        _context.Set<Currency>().Add(currency);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var result = await _sut.GetAllCurrenciesAsync(TestContext.Current.CancellationToken);

        // Assert
        result.Should().HaveCount(1);
        result[0].Code.Should().Be(code);
    }

    private static List<Currency> CreateTestCurrencies()
    {
        return
        [
            new Currency { Code = "USD", EnglishName = "US Dollar", CountryCode = "US" },
            new Currency { Code = "EUR", EnglishName = "Euro", CountryCode = null },
            new Currency { Code = "GBP", EnglishName = "British Pound", CountryCode = "GB" },
            new Currency { Code = "JPY", EnglishName = "Japanese Yen", CountryCode = "JP" }
        ];
    }
}