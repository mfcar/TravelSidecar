using System.Security.Cryptography.X509Certificates;
using Api.Data.Context;
using Quartz;

namespace Api.Extensions;

public static class OpenIddictExtensions
{
    public static IServiceCollection AddOpenIddictServices(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddQuartz(options =>
        {
            options.UseSimpleTypeLoader();
            options.UseInMemoryStore();
        });

        services.AddQuartzHostedService(options => options.WaitForJobsToComplete = true);

        services.AddOpenIddict()
            .AddCore(options =>
            {
                options.UseEntityFrameworkCore()
                    .UseDbContext<ApplicationContext>()
                    .ReplaceDefaultEntities<Guid>();

                options.UseQuartz();
            })

            .AddServer(options =>
            {
                options.SetTokenEndpointUris("api/connect/token");

                options
                    .AllowRefreshTokenFlow()
                    .AllowPasswordFlow();

                options.AcceptAnonymousClients();
                
                options.DisableAccessTokenEncryption();

                options.UseReferenceAccessTokens();
                options.UseReferenceRefreshTokens();

                if (configuration["OpenIddict:UseDevKey"]?.ToLowerInvariant() == "true")
                {
                    options
                        .AddDevelopmentEncryptionCertificate()
                        .AddDevelopmentSigningCertificate();
                }
                else
                {
                    var certificatePath = configuration["OpenIddict:CertificatePath"];
                    var certificatePassword = configuration["OpenIddict:CertificatePassword"];

                    if (!string.IsNullOrEmpty(certificatePath) && !string.IsNullOrEmpty(certificatePassword))
                    {
                        var certificate = new X509Certificate2(
                            certificatePath,
                            certificatePassword,
                            X509KeyStorageFlags.MachineKeySet |
                            X509KeyStorageFlags.PersistKeySet |
                            X509KeyStorageFlags.Exportable);

                        options
                            .AddEncryptionCertificate(certificate)
                            .AddSigningCertificate(certificate);
                    }
                }

                options.RegisterScopes("api", "openid", "profile", "email", "offline_access");

                options.UseAspNetCore()
                    .EnableTokenEndpointPassthrough()
                    .DisableTransportSecurityRequirement();
            })

            .AddValidation(options =>
            {
                options.UseLocalServer();
                options.UseAspNetCore();
                options.UseSystemNetHttp();
            });

        return services;
    }
}
