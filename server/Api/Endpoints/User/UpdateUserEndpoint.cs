using System.Text.Json;
using Api.Data.Entities;
using Api.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Api.Endpoints.User;

public static partial class UserEndpoints
{
    public static async Task<IResult> UpdateUserAsync(
        Guid userId,
        UpdateUserRequest req,
        UserManager<ApplicationUser> userManager,
        CancellationToken ct)
    {
        var user = await userManager.Users.FirstOrDefaultAsync(u => u.Id == userId, ct);

        if (user == null)
        {
            return TypedResults.NotFound();
        }

        user.UserName = req.Username ?? user.UserName;
        user.Email = req.Email ?? user.Email;
        user.PreferredDateFormat = req.PreferredUserDateFormat ?? user.PreferredDateFormat;
        user.PreferredTimeFormat = req.PreferredUserTimeFormat ?? user.PreferredTimeFormat;

        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return TypedResults.Problem(JsonSerializer.Serialize(result.Errors), statusCode: 400);
        }

        return TypedResults.NoContent();
    }
}

public class UpdateUserRequest
{
    public string? Email { get; set; }
    public string? Username { get; set; }
    public UserDateFormat? PreferredUserDateFormat { get; set; }
    public UserTimeFormat? PreferredUserTimeFormat { get; set; }
}
