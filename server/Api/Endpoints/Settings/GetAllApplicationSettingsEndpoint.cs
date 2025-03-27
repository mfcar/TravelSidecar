using Api.Data.Context;
using Api.Enums;
using Api.Services;

namespace Api.Endpoints.Settings;

public static class ApplicationSettingsEndpoints
{
    public static async Task<IResult> GetAllApplicationSettingsAsync(
        ApplicationContext dbContext,
        IApplicationSettingsService applicationSettingsService)
    {
        return TypedResults.Ok(new
        {
            AllowRegistration = await applicationSettingsService.GetApplicationSettingAsync<bool>(SettingKey.AllowRegistration),
            LoginMethod = await applicationSettingsService.GetApplicationSettingAsync<LoginMethod>(SettingKey.LoginMethod),
            OidcAutoRegister = await applicationSettingsService.GetApplicationSettingAsync<bool>(SettingKey.OidcAutoRegister)
        });
    }
}
