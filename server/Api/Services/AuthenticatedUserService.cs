using Api.Data.Entities;
using Microsoft.AspNetCore.Identity;

namespace Api.Services;

public interface IAuthenticatedUserService
{
    Task<ApplicationUser?> GetUserAsync();
    Task<Guid?> GetUserIdAsync();
}

public class AuthenticatedUserService(
    IHttpContextAccessor httpContextAccessor,
    UserManager<ApplicationUser> userManager)
    : IAuthenticatedUserService
{
    private readonly HttpContext _httpContext =
        httpContextAccessor.HttpContext ?? throw new ArgumentNullException(nameof(httpContextAccessor));

    private ApplicationUser? _cachedUser;

    public async Task<ApplicationUser?> GetUserAsync()
    {
        if (_cachedUser != null) return _cachedUser;

        if (!_httpContext.User.Identity?.IsAuthenticated ?? false)
        {
            return null;
        }

        _cachedUser = await userManager.GetUserAsync(_httpContext.User);
        return _cachedUser;
    }

    public async Task<Guid?> GetUserIdAsync()
    {
        var user = await GetUserAsync();
        return user?.Id;
    }
}