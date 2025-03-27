using Api.DTOs.Config.Files;
using Minio;

namespace Api.Extensions;

public static class BlobStorageExtensions
{
    public static void AddBlobStorage(this IServiceCollection services, IConfiguration configuration)
    {
        var config = configuration.GetSection("FileStorage").Get<FileStorageOptions>();
        if (config.Provider.Equals("Minio", StringComparison.OrdinalIgnoreCase))
        {
            services.AddMinio(options =>
            {
                options
                    .WithEndpoint(config.Minio.Endpoint)
                    .WithCredentials(config.Minio.AccessKey, config.Minio.SecretKey)
                    .WithSSL(config.Minio.UseSSL)
                    .Build();
            });
        }
        else
        {
            services.AddMinio(options =>
            {
                options
                    .WithEndpoint($"s3.{config.S3.Region}.amazonaws.com")
                    .WithCredentials(config.S3.AccessKey, config.S3.SecretKey)
                    .WithSSL()
                    .WithRegion(config.S3.Region)
                    .Build();
            });
        }
    }
}
