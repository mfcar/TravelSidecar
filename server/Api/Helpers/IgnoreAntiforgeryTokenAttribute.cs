using Microsoft.AspNetCore.Antiforgery;

namespace Api.Helpers;

[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
public class IgnoreAntiforgeryTokenAttribute : Attribute, IAntiforgeryMetadata
{
    public bool RequiresValidation => false;
}
