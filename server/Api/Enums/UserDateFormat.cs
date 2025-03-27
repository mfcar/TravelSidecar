using System.ComponentModel;

namespace Api.Enums;

public enum UserDateFormat
{
    [Description("DD-MM-YYYY")] DD_MM_YYYY = 0, // 24-12-2024

    [Description("DD/MM/YYYY")] DD_MM_YYYY_SLASH = 1, // 24/12/2024

    [Description("DD.MM.YYYY")] DD_MM_YYYY_DOT = 2, // 24.12.2024

    [Description("YYYY-MM-DD")] YYYY_MM_DD = 3, // 2024-12-24

    [Description("YYYY/MM/DD")] YYYY_MM_DD_SLASH = 4, // 2024/12/24

    [Description("YYYY.MM.DD")] YYYY_MM_DD_DOT = 5, // 2024.12.24

    [Description("MM-DD-YYYY")] MM_DD_YYYY = 6, // 12-24-2024

    [Description("MM/DD/YYYY")] MM_DD_YYYY_SLASH = 7, // 12/24/2024

    [Description("MM.DD.YYYY")] MM_DD_YYYY_DOT = 8, // 12.24.2024

    [Description("dd MMMM yyyy")] dd_MMMM_yyyy = 9, // 24 December 2024

    [Description("dd MMM yyyy")] dd_MMM_yyyy = 10, // 24 Dec 2024

    [Description("MMM do, yyyy")] MMM_do_yyyy = 11, // Dec 24th, 2024

    [Description("MMMM do, yyyy")] MMMM_do_yyyy = 12 // December 24th, 2024
}