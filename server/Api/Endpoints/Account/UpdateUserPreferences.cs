using System.Text.Json;
using Api.Data.Entities;
using Api.Enums;
using Microsoft.AspNetCore.Identity;

namespace Api.Endpoints.Account;

public static partial class AccountEndpoints
{
    public static async Task<IResult> UpdateUserPreferencesAsync(
        UpdatePreferencesRequest req,
        HttpContext httpContext,
        UserManager<ApplicationUser> userManager,
        CancellationToken ct)
    {
        var userId = httpContext.User.FindFirst("sub")?.Value;
        if (userId == null)
        {
            return TypedResults.Unauthorized();
        }

        var user = await userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return TypedResults.Unauthorized();
        }

        user.PreferredDateFormat = req.PreferredUserDateFormat ?? user.PreferredDateFormat;
        user.PreferredTimeFormat = req.PreferredUserTimeFormat ?? user.PreferredTimeFormat;

        if (!string.IsNullOrEmpty(req.NewEmail))
        {
            user.Email = req.NewEmail;
        }

        var updateResult = await userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            return TypedResults.Problem(JsonSerializer.Serialize(updateResult.Errors), statusCode: 400);
        }

        if (!string.IsNullOrEmpty(req.NewPassword))
        {
            if (req.NewPassword != req.NewPasswordConfirmation)
            {
                return TypedResults.Problem("New password and confirmation do not match", statusCode: 400);
            }
            
            var passwordResult = await userManager.ChangePasswordAsync(user, req.CurrentPassword!, req.NewPassword);
            if (!passwordResult.Succeeded)
            {
                return TypedResults.Problem(JsonSerializer.Serialize(passwordResult.Errors), statusCode: 400);
            }
        }

        return TypedResults.NoContent();
    }
}

public class UpdatePreferencesRequest
{
    public string? NewEmail { get; set; }
    public string? CurrentPassword { get; set; }
    public string? NewPassword { get; set; }
    public string? NewPasswordConfirmation { get; set; }
    public UserDateFormat? PreferredUserDateFormat { get; set; }
    public UserTimeFormat? PreferredUserTimeFormat { get; set; }
}
