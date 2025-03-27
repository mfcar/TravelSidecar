namespace Api;

public static class DefaultProperties
{
    // Security - Role names and authentication scopes
    public const string AdminRoleName = "Admin";
    public const string UserRoleName = "User";
    public const string ApiScope = "api";
    
    // Image Dimensions - Maximum size constraints for image resizing
    public const int NormalMaxDimension = 1080;
    public const int MediumMaxDimension = 800;
    public const int SmallMaxDimension = 400;
    public const int TinyMaxDimension = 80;
    
    // Image Quality - Compression level settings for encoded images
    public const int JpegQuality = 85;
    public const int WebpQuality = 85;
}
