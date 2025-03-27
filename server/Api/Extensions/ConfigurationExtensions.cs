using Api.DTOs.Config;
using Api.DTOs.Config.Files;
using NodaTime;
using NodaTime.Serialization.SystemTextJson;

namespace Api.Extensions;

public static class ConfigurationExtensions
{
    public static void AddConfigurationExtensions(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddOptions<DatabaseConfiguration>()
            .Bind(configuration.GetSection("DatabaseConfiguration"))
            .ValidateDataAnnotations()
            .Validate(config =>
                !string.IsNullOrEmpty(config.User) &&
                !string.IsNullOrEmpty(config.Password) &&
                !string.IsNullOrEmpty(config.Name) &&
                !string.IsNullOrEmpty(config.Host) &&
                config.Port > 0, "Invalid database configuration");


        services.AddOptions<FileStorageOptions>()
            .Bind(configuration.GetSection("FileStorage"))
            .ValidateDataAnnotations();

        services.ConfigureHttpJsonOptions(jsonOptions =>
        {
            jsonOptions.SerializerOptions.ConfigureForNodaTime(DateTimeZoneProviders.Tzdb);
        });
    }
}
