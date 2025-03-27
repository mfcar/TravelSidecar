using System.Collections.Concurrent;
using System.Text.Json;
using Api.Enums;

namespace Api.Extensions;

public static class DefaultSettings
{
    public static readonly Dictionary<SettingKey, object> Defaults = new()
    {
        { SettingKey.AllowRegistration, true },
        { SettingKey.LogLevel, "Information" },
        { SettingKey.LoginMethod, LoginMethod.Hybrid },
        { SettingKey.OidcAutoRegister, false }
    };
    
    private static readonly ConcurrentDictionary<SettingKey, string> CachedDefaultSettings =
        new(Defaults.ToDictionary(
            kv => kv.Key,
            kv => SerializeValue(kv.Value)
        ));

    public static string SerializeValue(object value) => JsonSerializer.Serialize(value);
    
    public static bool ValidateSetting(SettingKey key, object value)
    {
        return key switch
        {
            SettingKey.AllowRegistration => value is bool,
            SettingKey.LogLevel => value is string,
            SettingKey.LoginMethod => value is LoginMethod or int,
            SettingKey.OidcAutoRegister => value is bool,
            _ => throw new NotImplementedException($"Validation for setting {key} is not implemented")
        };
    }

    public static string? GetCachedSettingValue(SettingKey key) =>
        CachedDefaultSettings.GetValueOrDefault(key);
}