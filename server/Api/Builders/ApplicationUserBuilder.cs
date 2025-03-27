using Api.Data.Entities;
using Api.Enums;

namespace Api.Builders;

public class ApplicationUserBuilder
{
    private readonly ApplicationUser _applicationUser;
    public ApplicationUser Build() => _applicationUser;
    
    public ApplicationUserBuilder(string email, string username)
    {
        _applicationUser = new ApplicationUser
        {
            Email = email,
            UserName = username
        };
    }
    
    public ApplicationUserBuilder WithPreferredDateFormat(UserDateFormat? dateFormat)
    {
        _applicationUser.PreferredDateFormat = dateFormat ?? UserDateFormat.DD_MM_YYYY;
        return this;
    }
    
    public ApplicationUserBuilder WithPreferredTimeFormat(UserTimeFormat? timeFormat)
    {
        _applicationUser.PreferredTimeFormat = timeFormat ?? UserTimeFormat.HH_MM_24;
        return this;
    }
}