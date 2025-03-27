using Api.Data.Entities;
using Microsoft.AspNetCore.Identity;

namespace Api.Data.Seeds;

public class DefaultAdminUserSeed : IDataSeed
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;
    private readonly ILogger<DefaultAdminUserSeed> _logger;

    public DefaultAdminUserSeed(
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager,
        ILogger<DefaultAdminUserSeed> logger)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        const string defaultAdminUsername = "admin";
        const string defaultAdminEmail = "admin@admin.user";
        const string defaultAdminPassword = "Admin@123456";
        const string adminRoleName = DefaultProperties.AdminRoleName;

        if (!await _roleManager.RoleExistsAsync(adminRoleName))
        {
            var adminRole = new ApplicationRole { Name = adminRoleName };
            var roleResult = await _roleManager.CreateAsync(adminRole);
            if (!roleResult.Succeeded)
            {
                _logger.LogError("Failed to create Admin role: {Error}",
                    string.Join(", ", roleResult.Errors.Select(e => e.Description)));
                return;
            }

            _logger.LogInformation("Created Admin role: {Role}", adminRole.Name);
        }

        var adminUser = await _userManager.FindByEmailAsync(defaultAdminEmail);
        if (adminUser == null)
        {
            adminUser = new ApplicationUser
            {
                UserName = defaultAdminUsername,
                Email = defaultAdminEmail,
                EmailConfirmed = true,
                RequirePasswordChange = true
            };

            var result = await _userManager.CreateAsync(adminUser, defaultAdminPassword);
            if (!result.Succeeded)
            {
                _logger.LogError("Failed to create default Admin user: {Error}",
                    string.Join(", ", result.Errors.Select(e => e.Description)));
                return;
            }

            await _userManager.AddToRoleAsync(adminUser, adminRoleName);

            _logger.LogInformation(
                "Created default admin user with username: {Username} - password: {Password}, password change required on first login",
                defaultAdminUsername, defaultAdminPassword);
        }
    }
}
