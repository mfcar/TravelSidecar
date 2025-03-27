using Api.Data.Context;
using Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Api.Data.Seeds;

public class DefaultCurrenciesSeed : IDataSeed
{
    private readonly ApplicationContext _dbContext;
    private readonly ILogger<DefaultCurrenciesSeed> _logger;

    public DefaultCurrenciesSeed(ApplicationContext dbContext, ILogger<DefaultCurrenciesSeed> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        var existingCurrencies = await _dbContext.Set<Currency>()
            .Select(c => c.Code)
            .ToListAsync();

        var currenciesToAdd = GetDefaultCurrencies()
            .Where(c => !existingCurrencies.Contains(c.Code))
            .ToList();

        if (currenciesToAdd.Count > 0)
        {
            await _dbContext.Set<Currency>().AddRangeAsync(currenciesToAdd);
            await _dbContext.SaveChangesAsync();
            _logger.LogInformation("Added {Count} default currencies", currenciesToAdd.Count);
        }
        else
        {
            _logger.LogInformation("All default currencies already present in the database");
        }
    }

    private static List<Currency> GetDefaultCurrencies()
    {
        return
        [
            new Currency { Code = "AED", EnglishName = "UAE Dirham", CountryCode = "AE" },
            new Currency { Code = "AFN", EnglishName = "Afghani", CountryCode = "AF" },
            new Currency { Code = "ALL", EnglishName = "Lek", CountryCode = "AL" },
            new Currency { Code = "AMD", EnglishName = "Armenian Dram", CountryCode = "AM" },
            new Currency { Code = "ANG", EnglishName = "Netherlands Antillean Guilder", CountryCode = "CW" },
            new Currency { Code = "AOA", EnglishName = "Kwanza", CountryCode = "AO" },
            new Currency { Code = "ARS", EnglishName = "Argentine Peso", CountryCode = "AR" },
            new Currency { Code = "AUD", EnglishName = "Australian Dollar", CountryCode = "AU" },
            new Currency { Code = "AWG", EnglishName = "Aruban Florin", CountryCode = "AW" },
            new Currency { Code = "AZN", EnglishName = "Azerbaijan Manat", CountryCode = "AZ" },
            new Currency { Code = "BAM", EnglishName = "Convertible Mark", CountryCode = "BA" },
            new Currency { Code = "BBD", EnglishName = "Barbados Dollar", CountryCode = "BB" },
            new Currency { Code = "BDT", EnglishName = "Taka", CountryCode = "BD" },
            new Currency { Code = "BGN", EnglishName = "Bulgarian Lev", CountryCode = "BG" },
            new Currency { Code = "BHD", EnglishName = "Bahraini Dinar", CountryCode = "BH" },
            new Currency { Code = "BIF", EnglishName = "Burundi Franc", CountryCode = "BI" },
            new Currency { Code = "BMD", EnglishName = "Bermudian Dollar", CountryCode = "BM" },
            new Currency { Code = "BND", EnglishName = "Brunei Dollar", CountryCode = "BN" },
            new Currency { Code = "BOB", EnglishName = "Boliviano", CountryCode = "BO" },
            new Currency { Code = "BOV", EnglishName = "Mvdol", CountryCode = "BO" },
            new Currency { Code = "BRL", EnglishName = "Brazilian Real", CountryCode = "BR" },
            new Currency { Code = "BSD", EnglishName = "Bahamian Dollar", CountryCode = "BS" },
            new Currency { Code = "BTN", EnglishName = "Ngultrum", CountryCode = "BT" },
            new Currency { Code = "BWP", EnglishName = "Pula", CountryCode = "BW" },
            new Currency { Code = "BYN", EnglishName = "Belarusian Ruble", CountryCode = "BY" },
            new Currency { Code = "BZD", EnglishName = "Belize Dollar", CountryCode = "BZ" },
            new Currency { Code = "CAD", EnglishName = "Canadian Dollar", CountryCode = "CA" },
            new Currency { Code = "CDF", EnglishName = "Congolese Franc", CountryCode = "CD" },
            new Currency { Code = "CHE", EnglishName = "WIR Euro", CountryCode = "CH" },
            new Currency { Code = "CHF", EnglishName = "Swiss Franc", CountryCode = "CH" },
            new Currency { Code = "CHW", EnglishName = "WIR Franc", CountryCode = "CH" },
            new Currency { Code = "CLF", EnglishName = "Unidad de Fomento", CountryCode = "CL" },
            new Currency { Code = "CLP", EnglishName = "Chilean Peso", CountryCode = "CL" },
            new Currency { Code = "CNY", EnglishName = "Chinese Yuan", CountryCode = "CN" },
            new Currency { Code = "COP", EnglishName = "Colombian Peso", CountryCode = "CO" },
            new Currency { Code = "COU", EnglishName = "Unidad de Valor Real", CountryCode = "CO" },
            new Currency { Code = "CRC", EnglishName = "Costa Rican Colon", CountryCode = "CR" },
            new Currency { Code = "CUP", EnglishName = "Cuban Peso", CountryCode = "CU" },
            new Currency { Code = "CVE", EnglishName = "Cabo Verde Escudo", CountryCode = "CV" },
            new Currency { Code = "CZK", EnglishName = "Czech Koruna", CountryCode = "CZ" },
            new Currency { Code = "DJF", EnglishName = "Djibouti Franc", CountryCode = "DJ" },
            new Currency { Code = "DKK", EnglishName = "Danish Krone", CountryCode = "DK" },
            new Currency { Code = "DOP", EnglishName = "Dominican Peso", CountryCode = "DO" },
            new Currency { Code = "DZD", EnglishName = "Algerian Dinar", CountryCode = "DZ" },
            new Currency { Code = "EGP", EnglishName = "Egyptian Pound", CountryCode = "EG" },
            new Currency { Code = "ERN", EnglishName = "Nakfa", CountryCode = "ER" },
            new Currency { Code = "ETB", EnglishName = "Ethiopian Birr", CountryCode = "ET" },
            new Currency { Code = "EUR", EnglishName = "Euro", CountryCode = "EU" },
            new Currency { Code = "FJD", EnglishName = "Fiji Dollar", CountryCode = "FJ" },
            new Currency { Code = "FKP", EnglishName = "Falkland Islands Pound", CountryCode = "FK" },
            new Currency { Code = "GBP", EnglishName = "British Pound", CountryCode = "GB" },
            new Currency { Code = "GEL", EnglishName = "Lari", CountryCode = "GE" },
            new Currency { Code = "GHS", EnglishName = "Ghana Cedi", CountryCode = "GH" },
            new Currency { Code = "GIP", EnglishName = "Gibraltar Pound", CountryCode = "GI" },
            new Currency { Code = "GMD", EnglishName = "Dalasi", CountryCode = "GM" },
            new Currency { Code = "GNF", EnglishName = "Guinean Franc", CountryCode = "GN" },
            new Currency { Code = "GTQ", EnglishName = "Quetzal", CountryCode = "GT" },
            new Currency { Code = "GYD", EnglishName = "Guyana Dollar", CountryCode = "GY" },
            new Currency { Code = "HKD", EnglishName = "Hong Kong Dollar", CountryCode = "HK" },
            new Currency { Code = "HNL", EnglishName = "Lempira", CountryCode = "HN" },
            new Currency { Code = "HTG", EnglishName = "Gourde", CountryCode = "HT" },
            new Currency { Code = "HUF", EnglishName = "Forint", CountryCode = "HU" },
            new Currency { Code = "IDR", EnglishName = "Rupiah", CountryCode = "ID" },
            new Currency { Code = "ILS", EnglishName = "New Israeli Sheqel", CountryCode = "IL" },
            new Currency { Code = "INR", EnglishName = "Indian Rupee", CountryCode = "IN" },
            new Currency { Code = "IQD", EnglishName = "Iraqi Dinar", CountryCode = "IQ" },
            new Currency { Code = "IRR", EnglishName = "Iranian Rial", CountryCode = "IR" },
            new Currency { Code = "ISK", EnglishName = "Iceland Krona", CountryCode = "IS" },
            new Currency { Code = "JMD", EnglishName = "Jamaican Dollar", CountryCode = "JM" },
            new Currency { Code = "JOD", EnglishName = "Jordanian Dinar", CountryCode = "JO" },
            new Currency { Code = "JPY", EnglishName = "Japanese Yen", CountryCode = "JP" },
            new Currency { Code = "KES", EnglishName = "Kenyan Shilling", CountryCode = "KE" },
            new Currency { Code = "KGS", EnglishName = "Som", CountryCode = "KG" },
            new Currency { Code = "KHR", EnglishName = "Riel", CountryCode = "KH" },
            new Currency { Code = "KMF", EnglishName = "Comorian Franc", CountryCode = "KM" },
            new Currency { Code = "KPW", EnglishName = "North Korean Won", CountryCode = "KP" },
            new Currency { Code = "KRW", EnglishName = "Won", CountryCode = "KR" },
            new Currency { Code = "KWD", EnglishName = "Kuwaiti Dinar", CountryCode = "KW" },
            new Currency { Code = "KYD", EnglishName = "Cayman Islands Dollar", CountryCode = "KY" },
            new Currency { Code = "KZT", EnglishName = "Tenge", CountryCode = "KZ" },
            new Currency { Code = "LAK", EnglishName = "Lao Kip", CountryCode = "LA" },
            new Currency { Code = "LBP", EnglishName = "Lebanese Pound", CountryCode = "LB" },
            new Currency { Code = "LKR", EnglishName = "Sri Lanka Rupee", CountryCode = "LK" },
            new Currency { Code = "LRD", EnglishName = "Liberian Dollar", CountryCode = "LR" },
            new Currency { Code = "LSL", EnglishName = "Loti", CountryCode = "LS" },
            new Currency { Code = "LYD", EnglishName = "Libyan Dinar", CountryCode = "LY" },
            new Currency { Code = "MAD", EnglishName = "Moroccan Dirham", CountryCode = "MA" },
            new Currency { Code = "MDL", EnglishName = "Moldovan Leu", CountryCode = "MD" },
            new Currency { Code = "MGA", EnglishName = "Malagasy Ariary", CountryCode = "MG" },
            new Currency { Code = "MKD", EnglishName = "Denar", CountryCode = "MK" },
            new Currency { Code = "MMK", EnglishName = "Kyat", CountryCode = "MM" },
            new Currency { Code = "MNT", EnglishName = "Tugrik", CountryCode = "MN" },
            new Currency { Code = "MOP", EnglishName = "Pataca", CountryCode = "MO" },
            new Currency { Code = "MRU", EnglishName = "Ouguiya", CountryCode = "MR" },
            new Currency { Code = "MUR", EnglishName = "Mauritius Rupee", CountryCode = "MU" },
            new Currency { Code = "MVR", EnglishName = "Rufiyaa", CountryCode = "MV" },
            new Currency { Code = "MWK", EnglishName = "Malawi Kwacha", CountryCode = "MW" },
            new Currency { Code = "MXN", EnglishName = "Mexican Peso", CountryCode = "MX" },
            new Currency { Code = "MXV", EnglishName = "Mexican Unidad de Inversion (UDI)", CountryCode = "MX" },
            new Currency { Code = "MYR", EnglishName = "Malaysian Ringgit", CountryCode = "MY" },
            new Currency { Code = "MZN", EnglishName = "Mozambique Metical", CountryCode = "MZ" },
            new Currency { Code = "NAD", EnglishName = "Namibia Dollar", CountryCode = "NA" },
            new Currency { Code = "NGN", EnglishName = "Naira", CountryCode = "NG" },
            new Currency { Code = "NIO", EnglishName = "Cordoba Oro", CountryCode = "NI" },
            new Currency { Code = "NOK", EnglishName = "Norwegian Krone", CountryCode = "NO" },
            new Currency { Code = "NPR", EnglishName = "Nepalese Rupee", CountryCode = "NP" },
            new Currency { Code = "NZD", EnglishName = "New Zealand Dollar", CountryCode = "NZ" },
            new Currency { Code = "OMR", EnglishName = "Rial Omani", CountryCode = "OM" },
            new Currency { Code = "PAB", EnglishName = "Balboa", CountryCode = "PA" },
            new Currency { Code = "PEN", EnglishName = "Sol", CountryCode = "PE" },
            new Currency { Code = "PGK", EnglishName = "Kina", CountryCode = "PG" },
            new Currency { Code = "PHP", EnglishName = "Philippine Peso", CountryCode = "PH" },
            new Currency { Code = "PKR", EnglishName = "Pakistan Rupee", CountryCode = "PK" },
            new Currency { Code = "PLN", EnglishName = "Zloty", CountryCode = "PL" },
            new Currency { Code = "PYG", EnglishName = "Guarani", CountryCode = "PY" },
            new Currency { Code = "QAR", EnglishName = "Qatari Rial", CountryCode = "QA" },
            new Currency { Code = "RON", EnglishName = "Romanian Leu", CountryCode = "RO" },
            new Currency { Code = "RSD", EnglishName = "Serbian Dinar", CountryCode = "RS" },
            new Currency { Code = "RUB", EnglishName = "Russian Ruble", CountryCode = "RU" },
            new Currency { Code = "RWF", EnglishName = "Rwanda Franc", CountryCode = "RW" },
            new Currency { Code = "SAR", EnglishName = "Saudi Riyal", CountryCode = "SA" },
            new Currency { Code = "SBD", EnglishName = "Solomon Islands Dollar", CountryCode = "SB" },
            new Currency { Code = "SCR", EnglishName = "Seychelles Rupee", CountryCode = "SC" },
            new Currency { Code = "SDG", EnglishName = "Sudanese Pound", CountryCode = "SD" },
            new Currency { Code = "SEK", EnglishName = "Swedish Krona", CountryCode = "SE" },
            new Currency { Code = "SGD", EnglishName = "Singapore Dollar", CountryCode = "SG" },
            new Currency { Code = "SHP", EnglishName = "Saint Helena Pound", CountryCode = "SH" },
            new Currency { Code = "SLE", EnglishName = "Leone", CountryCode = "SL" },
            new Currency { Code = "SOS", EnglishName = "Somali Shilling", CountryCode = "SO" },
            new Currency { Code = "SRD", EnglishName = "Surinam Dollar", CountryCode = "SR" },
            new Currency { Code = "SSP", EnglishName = "South Sudanese Pound", CountryCode = "SS" },
            new Currency { Code = "STN", EnglishName = "Dobra", CountryCode = "ST" },
            new Currency { Code = "SVC", EnglishName = "El Salvador Colon", CountryCode = "SV" },
            new Currency { Code = "SYP", EnglishName = "Syrian Pound", CountryCode = "SY" },
            new Currency { Code = "SZL", EnglishName = "Lilangeni", CountryCode = "SZ" },
            new Currency { Code = "THB", EnglishName = "Baht", CountryCode = "TH" },
            new Currency { Code = "TJS", EnglishName = "Somoni", CountryCode = "TJ" },
            new Currency { Code = "TMT", EnglishName = "Turkmenistan New Manat", CountryCode = "TM" },
            new Currency { Code = "TND", EnglishName = "Tunisian Dinar", CountryCode = "TN" },
            new Currency { Code = "TOP", EnglishName = "Pa'anga", CountryCode = "TO" },
            new Currency { Code = "TRY", EnglishName = "Turkish Lira", CountryCode = "TR" },
            new Currency { Code = "TTD", EnglishName = "Trinidad and Tobago Dollar", CountryCode = "TT" },
            new Currency { Code = "TWD", EnglishName = "New Taiwan Dollar", CountryCode = "TW" },
            new Currency { Code = "TZS", EnglishName = "Tanzanian Shilling", CountryCode = "TZ" },
            new Currency { Code = "UAH", EnglishName = "Hryvnia", CountryCode = "UA" },
            new Currency { Code = "UGX", EnglishName = "Uganda Shilling", CountryCode = "UG" },
            new Currency { Code = "USD", EnglishName = "US Dollar", CountryCode = "US" },
            new Currency { Code = "UYI", EnglishName = "Uruguay Peso en Unidades Indexadas (UI)", CountryCode = "UY" },
            new Currency { Code = "UYU", EnglishName = "Peso Uruguayo", CountryCode = "UY" },
            new Currency { Code = "UYW", EnglishName = "Unidad Previsional", CountryCode = "UY" },
            new Currency { Code = "UZS", EnglishName = "Uzbekistan Sum", CountryCode = "UZ" },
            new Currency { Code = "VED", EnglishName = "Bolívar Soberano", CountryCode = "VE" },
            new Currency { Code = "VES", EnglishName = "Bolívar Soberano", CountryCode = "VE" },
            new Currency { Code = "VND", EnglishName = "Dong", CountryCode = "VN" },
            new Currency { Code = "VUV", EnglishName = "Vatu", CountryCode = "VU" },
            new Currency { Code = "WST", EnglishName = "Tala", CountryCode = "WS" },
            new Currency { Code = "XAF", EnglishName = "CFA Franc BEAC", CountryCode = "CM" },
            new Currency { Code = "XCD", EnglishName = "East Caribbean Dollar", CountryCode = "AG" },
            new Currency { Code = "XDR", EnglishName = "SDR (Special Drawing Right)", CountryCode = "" },
            new Currency { Code = "XOF", EnglishName = "CFA Franc BCEAO", CountryCode = "BJ" },
            new Currency { Code = "XPF", EnglishName = "CFP Franc", CountryCode = "PF" },
            new Currency { Code = "XSU", EnglishName = "Sucre", CountryCode = "" },
            new Currency { Code = "YER", EnglishName = "Yemeni Rial", CountryCode = "YE" },
            new Currency { Code = "ZAR", EnglishName = "Rand", CountryCode = "ZA" },
            new Currency { Code = "ZMW", EnglishName = "Zambian Kwacha", CountryCode = "ZM" },
            new Currency { Code = "ZWG", EnglishName = "Zimbabwe Gold", CountryCode = "ZW" },
        ];
    }
}
