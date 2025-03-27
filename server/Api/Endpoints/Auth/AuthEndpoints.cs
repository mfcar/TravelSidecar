using System.Security.Claims;
using Api.Data.Entities;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using NodaTime;
using OpenIddict.Abstractions;
using OpenIddict.Server.AspNetCore;

namespace Api.Endpoints.Auth;

public static class AuthEndpoints
{
    public static async Task<IResult> HandleToken(
        HttpContext httpContext,
        SignInManager<ApplicationUser> signInManager,
        UserManager<ApplicationUser> userManager)
    {
        var request = httpContext.GetOpenIddictServerRequest() ??
                      throw new InvalidOperationException("The OpenID Connect request cannot be retrieved.");

        if (request.IsPasswordGrantType())
        {
            var user = await userManager.FindByNameAsync(request.Username) ??
                       await userManager.FindByEmailAsync(request.Username);

            if (user == null)
            {
                var items = new Dictionary<string, string>
                {
                    [OpenIddictServerAspNetCoreConstants.Properties.Error] = OpenIddictConstants.Errors.InvalidGrant,
                    [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] =
                        "The username or password is invalid."
                };
                return TypedResults.Forbid(
                    new AuthenticationProperties(items),
                    [OpenIddictServerAspNetCoreDefaults.AuthenticationScheme]);
            }

            var result = await signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);
            if (!result.Succeeded)
            {
                var items = new Dictionary<string, string>
                {
                    [OpenIddictServerAspNetCoreConstants.Properties.Error] = OpenIddictConstants.Errors.InvalidGrant,
                    [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] =
                        "The username or password is invalid."
                };
                return TypedResults.Forbid(
                    new AuthenticationProperties(items),
                    [OpenIddictServerAspNetCoreDefaults.AuthenticationScheme]);
            }

            user.LastActiveAt = Instant.FromDateTimeUtc(DateTime.UtcNow);
            await userManager.UpdateAsync(user);

            var principal = await CreateClaimsPrincipalAsync(user, userManager);

            return TypedResults.SignIn(principal,
                authenticationScheme: OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
        }
        else if (request.IsRefreshTokenGrantType())
        {
            var result = await httpContext.AuthenticateAsync(OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
            var userId = result.Principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                var items = new Dictionary<string, string>
                {
                    [OpenIddictServerAspNetCoreConstants.Properties.Error] = OpenIddictConstants.Errors.InvalidGrant,
                    [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] =
                        "The refresh token is no longer valid."
                };
                return TypedResults.Forbid(
                    new AuthenticationProperties(items),
                    [OpenIddictServerAspNetCoreDefaults.AuthenticationScheme]);
            }

            var user = await userManager.FindByIdAsync(userId);
            if (user == null)
            {
                var items = new Dictionary<string, string>
                {
                    [OpenIddictServerAspNetCoreConstants.Properties.Error] = OpenIddictConstants.Errors.InvalidGrant,
                    [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = "The user no longer exists."
                };
                return TypedResults.Forbid(
                    new AuthenticationProperties(items),
                    [OpenIddictServerAspNetCoreDefaults.AuthenticationScheme]);
            }

            user.LastActiveAt = Instant.FromDateTimeUtc(DateTime.UtcNow);
            await userManager.UpdateAsync(user);

            var principal = await CreateClaimsPrincipalAsync(user, userManager);

            return TypedResults.SignIn(principal,
                authenticationScheme: OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
        }

        var dictionary = new Dictionary<string, string>
        {
            [OpenIddictServerAspNetCoreConstants.Properties.Error] = OpenIddictConstants.Errors.UnsupportedGrantType,
            [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] =
                "The specified grant type is not supported."
        };
        return TypedResults.Forbid(
            new AuthenticationProperties(dictionary),
            [OpenIddictServerAspNetCoreDefaults.AuthenticationScheme]);
    }

    private static async Task<ClaimsPrincipal> CreateClaimsPrincipalAsync(ApplicationUser user,
        UserManager<ApplicationUser> userManager)
    {
        var identity = new ClaimsIdentity(
            OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
            ClaimTypes.Name,
            ClaimTypes.Role);

        identity.AddClaim(new Claim(OpenIddictConstants.Claims.Subject, user.Id.ToString()));
        identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()));
        identity.AddClaim(new Claim(ClaimTypes.Name, user.UserName));
        identity.AddClaim(new Claim(ClaimTypes.Email, user.Email));

        identity.AddClaim(new Claim("require_password_change", user.RequirePasswordChange.ToString().ToLower()));

        if (!string.IsNullOrEmpty(user.ExternalProviderName))
        {
            identity.AddClaim(new Claim("ext_provider", user.ExternalProviderName));
        }

        var roles = await userManager.GetRolesAsync(user);
        foreach (var role in roles)
        {
            identity.AddClaim(new Claim(ClaimTypes.Role, role));
        }

        identity.AddClaim(new Claim("scope", "api openid profile email offline_access"));

        var principal = new ClaimsPrincipal(identity);

        principal.SetScopes("api", "openid", "profile", "email", "offline_access");

        foreach (var claim in principal.Claims)
        {
            claim.SetDestinations(GetDestinations(claim, principal));
        }

        return principal;
    }

    private static List<string> GetDestinations(Claim claim, ClaimsPrincipal principal)
    {
        if (claim.Type == ClaimTypes.Role)
        {
            return [OpenIddictConstants.Destinations.AccessToken, OpenIddictConstants.Destinations.IdentityToken];
        }

        var destinations = new List<string>
        {
            OpenIddictConstants.Destinations.AccessToken
        };

        switch (claim.Type)
        {
            case ClaimTypes.Name when principal.HasScope("profile"):
            case ClaimTypes.Email when principal.HasScope("email"):
            case ClaimTypes.Role when principal.HasScope("profile"):
            case "scope":
            case "require_password_change":
                destinations.Add(OpenIddictConstants.Destinations.IdentityToken);
                break;
        }

        return destinations;
    }
}
