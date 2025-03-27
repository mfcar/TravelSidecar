using Api.Builders;
using Api.Data.Context;
using Api.Data.Entities;
using Api.DTOs.JourneyCategories;
using Api.Extensions;
using Api.Services;
using Microsoft.AspNetCore.Identity;

namespace Api.Endpoints.JourneyCategory;

public static partial class JourneyCategoryEndpoints
{
    public static async Task<IResult> CreateJourneyCategoryAsync(CreateUpdateJourneyCategoryRequest req,
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

        var journeyCategory = new JourneyCategoryBuilder(authenticatedUser.Id, req.Name)
            .WithDescription(req.Description)
            .Build();

        context.JourneyCategories.Add(journeyCategory);
        await context.SaveChangesAsync(ct);

        var journeyCategoryResponse = new CreateUpdateJourneyCategoryResponse
        {
            Id = journeyCategory.Id,
            Name = journeyCategory.Name,
            Description = journeyCategory.Description,
            CreatedAt = journeyCategory.CreatedAt.ToDateTimeOffset()
        };

        return TypedResults.Created($"/{Routes.JourneyCategories.Base}/{journeyCategoryResponse.Id}",
            journeyCategoryResponse);
    }
}
