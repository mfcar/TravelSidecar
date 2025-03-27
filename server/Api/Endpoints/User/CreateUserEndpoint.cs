using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using Api.Builders;
using Api.Data.Context;
using Api.Data.Entities;
using Api.Extensions;
using Api.Services;
using Microsoft.AspNetCore.Identity;

namespace Api.Endpoints.User;

public static partial class UserEndpoints
{
    public static async Task<IResult> CreateUserAsync(CreateUserRequest req,
        HttpContext httpContext,
        ApplicationContext context,
        UserManager<ApplicationUser> userManager,
        IAuthenticatedUserService authenticatedUserService,
        CancellationToken ct)
    {
        var authenticatedUser = await authenticatedUserService.GetUserAsync();
        if (authenticatedUser == null)
        {
            return TypedResults.Unauthorized();
        }

        var user = new ApplicationUserBuilder(req.Email, req.Username)
            .Build();

        var result = await userManager.CreateAsync(user, req.TemporaryPassword);
        if (!result.Succeeded)
        {
            return TypedResults.Problem(JsonSerializer.Serialize(result.Errors), statusCode: 400);
        }

        var createdUser = new CreateUserResponse
        {
            Id = user.Id,
            Username = user.UserName,
            Email = user.Email
        };

        return TypedResults.Created($"/{Routes.Users.Base}/{createdUser.Id}",
            createdUser);
    }
}

public class CreateUserRequest
{
    [Required]
    [MinLength(3)]
    [MaxLength(256)]
    public required string Username { get; set; }

    [Required]
    [MinLength(3)]
    [MaxLength(256)]
    public required string Email { get; set; }

    [Required] public required string TemporaryPassword { get; set; }
}

public class CreateUserResponse
{
    public Guid Id { get; init; }

    public required string Username { get; set; }

    public required string Email { get; set; }
}
