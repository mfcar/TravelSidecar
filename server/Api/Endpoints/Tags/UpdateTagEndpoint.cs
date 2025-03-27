using Api.Data.Context;
using Api.Data.Entities;
using Api.DTOs.Tags;
using Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Api.Endpoints.Tags;

public static partial class TagEndpoints
{
    public static async Task<IResult> UpdateTagAsync(
        Guid tagId,
        CreateUpdateTagRequest req,
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

        var tag = await context.Tags.FirstOrDefaultAsync(t => t.Id == tagId, ct);
        if (tag == null)
        {
            return TypedResults.NotFound();
        }

        if (tag.UserId != authenticatedUser.Id)
        {
            var isAdmin = await userManager.IsInRoleAsync(authenticatedUser, "Admin");
            if (!isAdmin)
            {
                return TypedResults.Forbid();
            }
        }

        tag.Name = req.Name.Trim();
        tag.Color = req.Color.Trim();
        tag.LastModifiedAt = Instant.FromDateTimeUtc(DateTime.UtcNow);

        await context.SaveChangesAsync(ct);

        var response = new CreateUpdateTagResponse
        {
            Id = tag.Id,
            Name = tag.Name,
            Color = tag.Color,
            CreatedAt = tag.CreatedAt.ToDateTimeOffset(),
            LastModifiedAt = tag.LastModifiedAt.ToDateTimeOffset()
        };

        return TypedResults.NoContent();
    }
}
