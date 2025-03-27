namespace Api.Extensions;

public static class Routes
{
    public static class Account
    {
        public const string Base = "/account";
        public const string Login = "/login";
        public const string Register = "/register";
        public const string UpdatePreferences = "/update-preferences";
    }

    public static class ApplicationSettings
    {
        public const string Base = "/application-settings";
    }
    
    public static class BucketListItems
    {
        public const string Base = "/bucket-list-items";
    }
    
    public static class Currency
    {
        public const string Base = "/currencies";
    }
    
    public static class Files
    {
        public const string Base = "/files";
    }
    
    public static class Preferences
    {
        public const string Base = "/preferences";
    }
    
    public static class JourneyCategories
    {
        public const string Base = "/journey-categories";
    }
    
    public static class Journeys
    {
        public const string Base = "/journeys";
    }

    public static class SystemInfo
    {
        public const string Base = "/system-info";
    }

    public static class Timezone
    {
        public const string Base = "/timezones";
    }
    
    public static class Tags
    {
        public const string Base = "/tags";
    }

    public static class Users
    {
        public const string Base = "/users";
    }
}
