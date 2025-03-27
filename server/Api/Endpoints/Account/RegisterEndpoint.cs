using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using Api.Builders;
using Api.Data.Entities;
using Api.Enums;
using Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Api.Endpoints.Account;

public static partial class AccountEndpoints
{
    public static async Task<IResult> RegisterAsync(
        [FromBody] RegisterRequest req,
        UserManager<ApplicationUser> userManager,
        IApplicationSettingsService applicationSettingsService,
        CancellationToken ct)
    {
        if (!await applicationSettingsService.GetApplicationSettingAsync<bool>(SettingKey.AllowRegistration))
        {
            return TypedResults.Problem("Registration is disabled", statusCode: 403);
        }

        if (!ValidateRegisterRequest(req, out var validationErrors))
        {
            return TypedResults.Problem(validationErrors, statusCode: 400);
        }

        var user = new ApplicationUserBuilder(req.Email.Trim(), req.Username.Trim())
            .WithPreferredDateFormat(req.PreferredUserDateFormat)
            .WithPreferredTimeFormat(req.PreferredUserTimeFormat)
            .Build();

        var result = await userManager.CreateAsync(user, req.Password);
        if (!result.Succeeded)
        {
            return TypedResults.Problem(JsonSerializer.Serialize(result.Errors), statusCode: 400);
        }

        return TypedResults.Ok(new RegisterResponse { Message = "User registered successfully" });
    }

    private static bool ValidateRegisterRequest(RegisterRequest req, out string validationErrors)
    {
        var validationContext = new ValidationContext(req);
        var validationResults = new List<ValidationResult>();
        var isValid = Validator.TryValidateObject(req, validationContext, validationResults, true);

        validationErrors = isValid ? string.Empty : JsonSerializer.Serialize(validationResults);
        return isValid;
    }
}

public class RegisterRequest
{
    [Required] [EmailAddress] public string Email { get; set; } = null!;

    [Required] public string Username { get; set; } = null!;

    [Required] [MinLength(6)] public string Password { get; set; } = null!;

    public UserDateFormat PreferredUserDateFormat { get; set; } = UserDateFormat.DD_MM_YYYY;

    public UserTimeFormat PreferredUserTimeFormat { get; set; } = UserTimeFormat.HH_MM_24;
}

public class RegisterResponse
{
    public string Message { get; set; } = null!;
    public string[] Errors { get; set; } = [];
}
