namespace Api.Extensions;

public static class CorsExtensions
{
    /// <summary>
    /// Configures Cross-Origin Resource Sharing (CORS) policies for the application.
    /// </summary>
    public static void ConfigureCors(this IServiceCollection services)
    {
        var allowedOriginsDev = new[] { "http://localhost:5300" };

        services.AddCors(options =>
        {
            options.AddPolicy("DevelopmentCorsPolicy", builder =>
            {
                builder
                    .WithOrigins(allowedOriginsDev)
                    .AllowAnyHeader()
                    .AllowAnyMethod()    
                    .AllowCredentials();
            });

            options.AddPolicy("ProductionCorsPolicy", builder =>
            {
                builder
                    .SetIsOriginAllowed(_ => true)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });
    }

    /// <summary>
    /// Applies the configured CORS policy based on the current environment.
    /// </summary>
    public static void UseConfiguredCors(this IApplicationBuilder app, IHostEnvironment environment)
    {
        app.UseCors(environment.IsDevelopment() ? "DevelopmentCorsPolicy" : "ProductionCorsPolicy");
    }
}
