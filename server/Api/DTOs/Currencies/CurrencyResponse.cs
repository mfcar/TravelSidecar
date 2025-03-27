namespace Api.DTOs.Currencies;

public class CurrencyResponse
{
    public string Code { get; set; } = string.Empty;
    
    public string EnglishName { get; set; } = string.Empty;
    
    public string? CountryCode { get; set; }
}
