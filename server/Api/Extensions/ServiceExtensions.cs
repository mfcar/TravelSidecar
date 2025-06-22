using Api.Services;
using Api.Services.Files;
using Api.Services.Images;
using NodaTime;

namespace Api.Extensions;

public static class ServiceExtensions
{
    public static void AddApplicationServices(this IServiceCollection services)
    {
        services.AddHostedService<LifecycleService>();
        services.AddSingleton<IApplicationInfoService, ApplicationInfoService>();
        services.AddSingleton<IClock>(SystemClock.Instance);
        services.AddScoped<IAuthenticatedUserService, AuthenticatedUserService>();
        services.AddScoped<IApplicationSettingsService, ApplicationSettingsService>();
        services.AddScoped<IBucketListService, BucketListService>();
        services.AddScoped<ICurrencyService, CurrencyService>();
        services.AddScoped<IFileService, FileService>();
        services.AddScoped<IFileEncryptionService, FileEncryptionService>();
        services.AddScoped<IImageProcessingService, ImageProcessingService>();
        services.AddScoped<IOidcProviderService, OidcProviderService>();
        services.AddScoped<ITagService, TagService>();
        services.AddScoped<IJourneyService, JourneyService>();
        services.AddScoped<IJourneyCategoryService, JourneyCategoryService>();
        services.AddScoped<ITimezoneService, TimezoneService>();
        services.AddScoped<IUserPreferencesService, UserPreferencesService>();
        services.AddScoped<IVersionHistoryService, VersionHistoryService>();
    }
}
