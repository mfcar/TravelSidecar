using System.Text.Json;
using Api.Data.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Api.Endpoints.User;

public static partial class UserEndpoints
{
    public static async Task<IResult> DeleteUserAsync(
        Guid userId,
        UserManager<ApplicationUser> userManager,
        CancellationToken ct)
    {
        var user = await userManager.Users.FirstOrDefaultAsync(u => u.Id == userId, ct);

        if (user == null)
        {
            return TypedResults.NotFound();
        }

        user.IsDeleted = true;
        user.DeletedAt = NodaTime.SystemClock.Instance.GetCurrentInstant();

        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return TypedResults.Problem(JsonSerializer.Serialize(result.Errors), statusCode: 400);
        }

        return TypedResults.NoContent();
    }
}
