using Api.Endpoints.Account;
using Api.Endpoints.Auth;
using Api.Endpoints.BucketListItem;
using Api.Endpoints.Currency;
using Api.Endpoints.File;
using Api.Endpoints.Journey;
using Api.Endpoints.Preferences;
using Api.Endpoints.Settings;
using Api.Endpoints.SystemInfo;
using Api.Endpoints.Tags;
using Api.Endpoints.Timezone;
using Api.Endpoints.User;
using JourneyCategoryEndpoints = Api.Endpoints.JourneyCategory.JourneyCategoryEndpoints;

namespace Api.Extensions;

public static class EndpointExtensions
{
    public static void MapEndpoints(this WebApplication app)
    {
        var apiGroup = app.MapGroup("/api");

        var authEndpoints = apiGroup.MapPost("connect/token", AuthEndpoints.HandleToken)
            .WithName("Token")
            .AllowAnonymous()
            .WithOpenApi()
            .RequireRateLimiting(RateLimitExtensions.AuthPolicy);

        var accountEndpoints = apiGroup.MapGroup(Routes.Account.Base)
            .WithTags("Account")
            .RequireRateLimiting(RateLimitExtensions.AuthPolicy);
        accountEndpoints.MapPost(Routes.Account.Register, AccountEndpoints.RegisterAsync).AllowAnonymous();
        accountEndpoints.MapPost(Routes.Account.UpdatePreferences, AccountEndpoints.UpdateUserPreferencesAsync).RequireAuthorization();
        accountEndpoints.MapPost("/change-password", AccountEndpoints.ChangePasswordAsync).RequireAuthorization();
        
        var bucketListItemEndpoints = apiGroup.MapGroup(Routes.BucketListItems.Base)
            .WithTags("Bucket List Items")
            .RequireAuthorization()
            .RequireRateLimiting(RateLimitExtensions.DefaultPolicy);
        bucketListItemEndpoints.MapPost("/filter", BucketListItemEndpoints.FilterBucketListItemsAsync);
        bucketListItemEndpoints.MapPost("/", BucketListItemEndpoints.CreateBucketListItemAsync);
        
        var currencyEndpoints = apiGroup.MapGroup(Routes.Currency.Base)
            .WithTags("Currencies")
            .RequireAuthorization()
            .RequireRateLimiting(RateLimitExtensions.ReadPolicy);
        currencyEndpoints.MapGet("/", CurrencyEndpoints.ListAllCurrenciesAsync);
        
        var filesEndpoints = apiGroup.MapGroup(Routes.Files.Base)
            .WithTags("Files")
            .RequireAuthorization()
            .RequireRateLimiting(RateLimitExtensions.DefaultPolicy);
        filesEndpoints.MapPost("/upload", FileEndpoints.UploadFileAsync);
        filesEndpoints.MapGet("/{fileId:guid}", FileEndpoints.GetFileAsync);
        filesEndpoints.MapGet("/images/{fileId:guid}", FileEndpoints.GetImageAsync);
        filesEndpoints.MapDelete("/{fileId:guid}", FileEndpoints.DeleteFileAsync);
        filesEndpoints.MapGet("/journey/{journeyId:guid}", FileEndpoints.ListFilesByJourneyAsync);
        filesEndpoints.MapGet("/", FileEndpoints.ListFilesByUserAsync);
        filesEndpoints.MapGet("/journey/{journeyId:guid}/gallery", FileEndpoints.ListJourneyGalleryAsync);
        filesEndpoints.MapGet("/journey/{journeyId:guid}/documents", FileEndpoints.ListJourneyDocumentsAsync);
        filesEndpoints.MapPost("/bucketlist/{bucketListItemId:guid}/image", FileEndpoints.UploadBucketListItemImageAsync);
        filesEndpoints.MapPost("/journey/{journeyId:guid}/activity/{activityId:guid}/image", FileEndpoints.UploadJourneyActivityImageAsync);
        filesEndpoints.MapPost("/journey/{journeyId:guid}/activity/{activityId:guid}/document", FileEndpoints.UploadJourneyActivityDocumentAsync);
        
        var preferencesEndpoints = apiGroup.MapGroup(Routes.Preferences.Base)
            .WithTags("User Preferences")
            .RequireAuthorization()
            .RequireRateLimiting(RateLimitExtensions.DefaultPolicy);
        preferencesEndpoints.MapGet("/", UserPreferencesEndpoints.GetUserPreferencesAsync);
        preferencesEndpoints.MapPut("/basic", UserPreferencesEndpoints.UpdateBasicPreferencesAsync);
        preferencesEndpoints.MapPut("/{pageKey}", UserPreferencesEndpoints.UpdatePagePreferencesAsync);
        preferencesEndpoints.MapPut("/batch", UserPreferencesEndpoints.UpdateBatchPreferencesAsync);
        preferencesEndpoints.MapPost("/complete-setup", UserPreferencesEndpoints.CompleteInitialSetupAsync);
        
        var journeysEndpoint = apiGroup.MapGroup(Routes.Journeys.Base)
            .WithTags("Journeys")
            .RequireAuthorization()
            .RequireRateLimiting(RateLimitExtensions.DefaultPolicy);
        journeysEndpoint.MapPost("/filter", JourneyEndpoints.FilterJourneysAsync);
        journeysEndpoint.MapGet("/", JourneyEndpoints.ListAllJourneysAsync);
        journeysEndpoint.MapPost("/", JourneyEndpoints.CreateJourneyAsync);
        journeysEndpoint.MapGet("/{journeyId:guid}", JourneyEndpoints.GetJourneyByJourneyIdAsync);
        journeysEndpoint.MapPut("/{journeyId:guid}", JourneyEndpoints.UpdateJourneyAsync);

        var journeyCategoryEndpoints = apiGroup.MapGroup(Routes.JourneyCategories.Base)
            .WithTags("Journey Categories")
            .RequireAuthorization()
            .RequireRateLimiting(RateLimitExtensions.DefaultPolicy);
        journeyCategoryEndpoints.MapPost("/filter", JourneyCategoryEndpoints.FilterJourneyCategoriesAsync);
        journeyCategoryEndpoints.MapGet("/", JourneyCategoryEndpoints.ListAllJourneyCategoriesAsync);
        journeyCategoryEndpoints.MapPost("/", JourneyCategoryEndpoints.CreateJourneyCategoryAsync);
        journeyCategoryEndpoints.MapPut("/{journeyCategoryId:guid}", JourneyCategoryEndpoints.UpdateJourneyCategoryAsync);
        journeyCategoryEndpoints.MapGet("/{journeyCategoryId:guid}", JourneyCategoryEndpoints.GetJourneyCategoryByIdAsync);

        var settingsEndpoints = apiGroup.MapGroup(Routes.ApplicationSettings.Base)
            .WithTags("Settings")
            .RequireAuthorization()
            .RequireRateLimiting(RateLimitExtensions.AdminPolicy);
        settingsEndpoints.MapGet("/", ApplicationSettingsEndpoints.GetAllApplicationSettingsAsync);

        var systemInfoEndpoints = apiGroup.MapGroup(Routes.SystemInfo.Base)
            .WithTags("System Info")
            .RequireAuthorization("AdminOnly")
            .RequireRateLimiting(RateLimitExtensions.AdminPolicy);
        systemInfoEndpoints.MapGet("/status", SystemInfoEndpoints.GetSystemStatusAsync);

        var timezonesEndpoints = apiGroup.MapGroup(Routes.Timezone.Base)
            .WithTags("Timezones")
            .AllowAnonymous()
            .RequireRateLimiting(RateLimitExtensions.ReadPolicy);
        timezonesEndpoints.MapGet("/", TimezoneEndpoint.GetTimezoneListAsync);
        
        var tagsEndpoints = apiGroup.MapGroup(Routes.Tags.Base)
            .WithTags("Tags")
            .RequireAuthorization()
            .RequireRateLimiting(RateLimitExtensions.DefaultPolicy);
        tagsEndpoints.MapPost("/filter", TagEndpoints.FilterTagsAsync);
        tagsEndpoints.MapGet("/", TagEndpoints.ListAllTagsAsync);
        tagsEndpoints.MapPost("/", TagEndpoints.CreateTagAsync);
        tagsEndpoints.MapGet("/{tagId:guid}", TagEndpoints.GetTagByTagIdAsync);
        tagsEndpoints.MapPut("/{tagId:guid}", TagEndpoints.UpdateTagAsync);
        tagsEndpoints.MapDelete("/{tagId:guid}", TagEndpoints.DeleteTagAsync);

        var usersEndpoints = apiGroup.MapGroup(Routes.Users.Base)
            .WithTags("Users")
            // .RequireAuthorization("AdminOnly")
            .RequireRateLimiting(RateLimitExtensions.AdminPolicy);
        usersEndpoints.MapPost("/filter", UserEndpoints.FilterUsersAsync);
        usersEndpoints.MapGet("/", UserEndpoints.ListAllUsersAsync);
        usersEndpoints.MapPost("/", UserEndpoints.CreateUserAsync);
        usersEndpoints.MapGet("/{userId}", UserEndpoints.GetUserByUserIdAsync);
        usersEndpoints.MapPut("/{userId}", UserEndpoints.UpdateUserAsync);
        usersEndpoints.MapDelete("/{userId}", UserEndpoints.DeleteUserAsync);
    }
}
