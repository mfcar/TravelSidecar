using System.Globalization;
using System.Security.Claims;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

namespace Api.Extensions;

public static class RateLimitExtensions
{
    public const string DefaultPolicy = "default";
    public const string AuthPolicy = "auth";
    public const string ReadPolicy = "read";
    public const string AdminPolicy = "admin";

    public static void AddApplicationRateLimiting(this IServiceCollection services)
    {
        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            
            options.AddPolicy(DefaultPolicy, httpContext =>
            {
                var userId = httpContext.User.Identity?.IsAuthenticated == true
                    ? httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? httpContext.Connection.RemoteIpAddress?.ToString()
                    : httpContext.Connection.RemoteIpAddress?.ToString();

                return RateLimitPartition.GetFixedWindowLimiter(userId ?? "anonymous", _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 100,
                    Window = TimeSpan.FromMinutes(1),
                    QueueLimit = 5,
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst
                });
            });

            options.AddFixedWindowLimiter(AuthPolicy, opt =>
            {
                opt.PermitLimit = 10;
                opt.Window = TimeSpan.FromMinutes(1);
            });

            options.AddFixedWindowLimiter(ReadPolicy, opt =>
            {
                opt.PermitLimit = 150;
                opt.Window = TimeSpan.FromMinutes(1);
            });

            options.AddFixedWindowLimiter(AdminPolicy, opt =>
            {
                opt.PermitLimit = 20;
                opt.Window = TimeSpan.FromMinutes(1);
            });
            
            options.OnRejected = async (context, token) =>
            {
                var retryAfter = context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var seconds)
                    ? seconds.TotalSeconds.ToString(CultureInfo.InvariantCulture)
                    : "60";
    
                context.HttpContext.Response.Headers.Append("Retry-After", retryAfter);
                context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                await context.HttpContext.Response.WriteAsync("Too many requests. Please try again later.", token);
            };
        });
    }
}
