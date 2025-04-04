using System.ComponentModel;

namespace Api.Enums;

public enum FirstDayOfWeek
{
    [Description("Sunday")] Sunday = 0,
    [Description("Monday")] Monday = 1, 
    [Description("Tuesday")] Tuesday = 2,
    [Description("Wednesday")] Wednesday = 3,
    [Description("Thursday")] Thursday = 4,
    [Description("Friday")] Friday = 5,
    [Description("Saturday")] Saturday = 6
}
