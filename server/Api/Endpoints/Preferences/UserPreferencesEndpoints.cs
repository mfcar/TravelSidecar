using Api.DTOs.Preferences;
using Api.Services;

namespace Api.Endpoints.Preferences;

public static class UserPreferencesEndpoints
{
    public static async Task<IResult> GetUserPreferencesAsync(
        HttpContext httpContext,
        IUserPreferencesService preferencesService,
        IAuthenticatedUserService authenticatedUserService,
        CancellationToken ct)
    {
        var authenticatedUser = await authenticatedUserService.GetUserAsync();
        if (authenticatedUser == null)
        {
            return TypedResults.Unauthorized();
        }
        
        var preferences = await preferencesService.GetUserPreferencesAsync(authenticatedUser.Id, ct);
        return TypedResults.Ok(preferences);
    }
    
    public static async Task<IResult> UpdateBasicPreferencesAsync(
        HttpContext httpContext,
        IUserPreferencesService preferencesService,
        BasicUserPreferencesDto request,
        IAuthenticatedUserService authenticatedUserService,
        CancellationToken ct)
    {
        var authenticatedUser = await authenticatedUserService.GetUserAsync();
        if (authenticatedUser == null)
        {
            return TypedResults.Unauthorized();
        }
        
        await preferencesService.UpdateBasicPreferencesAsync(authenticatedUser.Id, request, ct);
        return TypedResults.NoContent();
    }
    
    public static async Task<IResult> UpdatePagePreferencesAsync(
        HttpContext httpContext,
        IUserPreferencesService preferencesService,
        string pageKey,
        HttpRequest request,
        IAuthenticatedUserService authenticatedUserService,
        CancellationToken ct)
    {
        var authenticatedUser = await authenticatedUserService.GetUserAsync();
        if (authenticatedUser == null)
        {
            return TypedResults.Unauthorized();
        }

        var pagePreferences = await request.ReadFromJsonAsync<ListPagePreferencesDto>(ct);
        if (pagePreferences == null)
        {
            return TypedResults.BadRequest("Invalid preference data format");
        }
        
        await preferencesService.UpdatePagePreferencesAsync(authenticatedUser.Id, pageKey, pagePreferences, ct);
        return TypedResults.NoContent();
    }
    
    public static async Task<IResult> UpdateBatchPreferencesAsync(
        HttpContext httpContext,
        IUserPreferencesService preferencesService,
        HttpRequest request,
        IAuthenticatedUserService authenticatedUserService,
        CancellationToken ct)
    {
        var authenticatedUser = await authenticatedUserService.GetUserAsync();
        if (authenticatedUser == null)
        {
            return TypedResults.Unauthorized();
        }

        var preferences = await request.ReadFromJsonAsync<Dictionary<string, ListPagePreferencesDto>>(ct);
        if (preferences == null)
        {
            return TypedResults.BadRequest("Invalid batch preference data format");
        }
        
        await preferencesService.UpdateBatchPagePreferencesAsync(authenticatedUser.Id, preferences, ct);
        return TypedResults.NoContent();
    }
    
    public static async Task<IResult> CompleteInitialSetupAsync(
        HttpContext httpContext,
        IUserPreferencesService preferencesService,
        IAuthenticatedUserService authenticatedUserService,
        CancellationToken ct)
    {
        var authenticatedUser = await authenticatedUserService.GetUserAsync();
        if (authenticatedUser == null)
        {
            return TypedResults.Unauthorized();
        }
        
        await preferencesService.CompleteInitialSetupAsync(authenticatedUser.Id, ct);
        return TypedResults.NoContent();
    }
}
