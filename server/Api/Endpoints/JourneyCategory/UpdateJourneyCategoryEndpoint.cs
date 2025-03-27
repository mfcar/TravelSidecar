using Api.Data.Context;
using Api.Data.Entities;
using Api.DTOs.JourneyCategories;
using Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Api.Endpoints.JourneyCategory;

public static partial class JourneyCategoryEndpoints
{
    public static async Task<IResult> UpdateJourneyCategoryAsync(Guid journeyCategoryId,
        CreateUpdateJourneyCategoryRequest req,
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

        var journeyCategory = await context.JourneyCategories.FirstOrDefaultAsync(t => t.Id == journeyCategoryId, ct);
        if (journeyCategory == null)
        {
            return TypedResults.NotFound();
        }

        if (journeyCategory.UserId != authenticatedUser.Id)
        {
            var isAdmin = await userManager.IsInRoleAsync(authenticatedUser, "Admin");
            if (!isAdmin)
            {
                return TypedResults.Forbid();
            }
        }
        
        journeyCategory.Name = req.Name;
        journeyCategory.Description = req.Description;
        journeyCategory.LastModifiedAt = Instant.FromDateTimeUtc(DateTime.UtcNow);

        await context.SaveChangesAsync(ct);

        var response = new CreateUpdateJourneyCategoryResponse
        {
            Id = journeyCategory.Id,
            Name = journeyCategory.Name,
            Description = journeyCategory.Description,
            CreatedAt = journeyCategory.CreatedAt.ToDateTimeOffset(),
            LastModifiedAt = journeyCategory.LastModifiedAt.ToDateTimeOffset()
        };

        return TypedResults.NoContent();
    }
}
