using Api.Services;

namespace Api.Endpoints.Currency;

public static class CurrencyEndpoints
{
    public static async Task<IResult> ListAllCurrenciesAsync(
        ICurrencyService currencyService,
        CancellationToken ct)
    {
        var currencies = await currencyService.GetAllCurrenciesAsync(ct);
        return TypedResults.Ok(currencies);
    }
}
