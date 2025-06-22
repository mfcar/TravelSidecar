using Amazon.S3;
using Amazon;
using Api.DTOs.Config.Files;
using Api.Services.Files;

namespace Api.Extensions;

public static class BlobStorageExtensions
{
    public static void AddBlobStorage(this IServiceCollection services, IConfiguration configuration)
    {
        var config = configuration.GetSection("FileStorage").Get<FileStorageOptions>() ?? new FileStorageOptions();
        
        services.AddSingleton<IAmazonS3>(_ =>
        {
            var awsConfig = new AmazonS3Config
            {
                ForcePathStyle = true
            };

            switch (config.Provider.ToLowerInvariant())
            {
                case "minio":
                    var minioConfig = config.Minio;
                    awsConfig.ServiceURL = $"{(minioConfig.UseSSL ? "https" : "http")}://{minioConfig.Endpoint}";
                    awsConfig.ForcePathStyle = true;
                    awsConfig.UseHttp = !minioConfig.UseSSL;
                    awsConfig.AuthenticationRegion = "us-east-1";
                    return new AmazonS3Client(config.GetAccessKey(), config.GetSecretKey(), awsConfig);
                    
                default:
                    var s3Config = config.S3;
                    if (!string.IsNullOrEmpty(s3Config.Endpoint))
                    {
                        awsConfig.ServiceURL = s3Config.Endpoint;
                        awsConfig.ForcePathStyle = s3Config.ForcePathStyle;
                    }
                    else
                    {
                        awsConfig.RegionEndpoint = RegionEndpoint.GetBySystemName(s3Config.Region);
                        awsConfig.ForcePathStyle = false;
                    }
                    return new AmazonS3Client(config.GetAccessKey(), config.GetSecretKey(), awsConfig);
            }
        });

        services.AddScoped<IFileStorageService, S3CompatibleStorageService>();
    }
    
    public static string GetAccessKey(this FileStorageOptions config)
    {
        return config.Provider.ToLowerInvariant() switch
        {
            "minio" => Environment.GetEnvironmentVariable("MINIO_ROOT_USER") ?? config.Minio.AccessKey,
            _ => Environment.GetEnvironmentVariable("AWS_ACCESS_KEY_ID") ?? config.S3.AccessKey
        };
    }
    
    public static string GetSecretKey(this FileStorageOptions config)
    {
        return config.Provider.ToLowerInvariant() switch
        {
            "minio" => Environment.GetEnvironmentVariable("MINIO_ROOT_PASSWORD") ?? config.Minio.SecretKey,
            _ => Environment.GetEnvironmentVariable("AWS_SECRET_ACCESS_KEY") ?? config.S3.SecretKey
        };
    }
}
