using Api.Extensions;
using Minio;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddMinio(configureClient => configureClient
    .WithEndpoint("localhost:9090")
    .WithCredentials("minio", "minio123")
    .WithSSL(false)
    .Build());

builder.Services.AddAntiforgery(options => {
    options.HeaderName = "X-CSRF-TOKEN";
});

builder.Services.AddAuthorization();
builder.Services.AddApplicationHealthChecks();
builder.Services.AddApplicationServices();
builder.Services.AddConfigurationExtensions(builder.Configuration);
builder.Services.AddDatabase();
builder.Services.AddHttpContextAccessor();
builder.Services.AddMemoryCache();
builder.Services.AddOpenApi();
builder.Services.AddProblemDetails();
builder.Services.AddApplicationRateLimiting();
builder.Services.ConfigureCors();
builder.Services.ConfigureSecurity();
builder.Services.AddOpenIddictServices(builder.Configuration);

var app = builder.Build();

await app.Services.EnsureDatabaseMigratedAndSeededAsync();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseDefaultFiles();
app.UseStaticFiles();
// TODO: Move to the MapStaticAssets when they fix the issue with the UseDefaultFiles
// app.MapStaticAssets();
app.Use(async (context, next) =>
{
    await next();

    if (context.Response.StatusCode == 404 &&
        !Path.HasExtension(context.Request.Path.Value) &&
        !context.Request.Path.Value.StartsWith("/api/"))
    {
        context.Request.Path = "/index.html";
        await next();
    }
});

app.UseConfiguredCors(app.Environment);

app.UseAuthentication();
app.UseAuthorization();
app.UseAntiforgery();
app.UseRateLimiter();

app.MapEndpoints();
app.MapFallbackToFile("index.html");
app.MapHealthCheckEndpoints();
app.Run();
