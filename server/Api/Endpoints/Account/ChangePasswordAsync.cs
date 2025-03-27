using System.ComponentModel.DataAnnotations;
using Api.Data.Entities;
using Api.Services;
using Microsoft.AspNetCore.Identity;

namespace Api.Endpoints.Account;

public static partial class AccountEndpoints
{
    public static async Task<IResult> ChangePasswordAsync(
        ChangePasswordRequest request,
        HttpContext httpContext,
        UserManager<ApplicationUser> userManager,
        IAuthenticatedUserService authenticatedUserService)
    {
        var user = await authenticatedUserService.GetUserAsync();
        if (user == null)
        {
            return TypedResults.Unauthorized();
        }

        var passwordValid = await userManager.CheckPasswordAsync(user, request.CurrentPassword);
        if (!passwordValid)
        {
            return TypedResults.BadRequest(new { error = "Current password is incorrect" });
        }

        var result = await userManager.ChangePasswordAsync(
            user,
            request.CurrentPassword,
            request.NewPassword);

        if (!result.Succeeded)
        {
            return TypedResults.BadRequest(new { errors = result.Errors.Select(e => e.Description) });
        }

        if (!user.RequirePasswordChange) return TypedResults.Ok(new { success = true });
        
        user.RequirePasswordChange = false;
        await userManager.UpdateAsync(user);

        return TypedResults.Ok(new { success = true });
    }
}

public class ChangePasswordRequest
{
    [Required] 
    public string CurrentPassword { get; set; } = string.Empty;

    [Required] 
    [MinLength(8)] 
    public string NewPassword { get; set; } = string.Empty;
}
