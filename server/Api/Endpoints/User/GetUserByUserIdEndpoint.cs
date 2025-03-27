using Api.Data.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Api.Endpoints.User;

public static partial class UserEndpoints
{
    public static async Task<IResult> GetUserByUserIdAsync(
        Guid userId,
        UserManager<ApplicationUser> userManager,
        CancellationToken ct)
    {
        var user = await userManager.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId, ct);

        if (user == null)
        {
            return TypedResults.NotFound();
        }

        return TypedResults.Ok(new UserResponse
        {
            Id = user.Id,
            Email = user.Email!,
            Username = user.UserName!,
            CreatedAt = user.CreatedAt.ToDateTimeOffset(),
            LastModifiedAt = user.LastModifiedAt.ToDateTimeOffset(),
            LastActiveAt = user.LastActiveAt?.ToDateTimeOffset()
        });
    }
}

public class GetUserByIdResponse
{
    public Guid Id { get; set; }
    public required string Email { get; set; }
    public required string Username { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset LastModifiedAt { get; set; }
    public DateTimeOffset? LastActiveAt { get; set; }
}
