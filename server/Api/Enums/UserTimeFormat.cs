using System.ComponentModel;

namespace Api.Enums;

public enum UserTimeFormat
{
    [Description("HH:MM 24")] HH_MM_24, // 14:30

    [Description("HH:MM 12")] HH_MM_12 // 2:30 PM
}