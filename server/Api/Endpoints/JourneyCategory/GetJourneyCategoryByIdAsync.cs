using Api.Data.Context;
using Api.DTOs.JourneyCategories;
using Api.DTOs.Journeys;
using Api.Services;
using Microsoft.EntityFrameworkCore;

namespace Api.Endpoints.JourneyCategory;

public static partial class JourneyCategoryEndpoints
{
    public static async Task<IResult> GetJourneyCategoryByIdAsync(
        Guid journeyCategoryId,
        HttpContext httpContext,
        ApplicationContext context,
        IAuthenticatedUserService authenticatedUserService,
        CancellationToken ct)
    {
        var user = await authenticatedUserService.GetUserAsync();
        if (user == null)
        {
            return TypedResults.Unauthorized();
        }

        var journeyCategory = await context.JourneyCategories
            .AsNoTracking()
            .Include(jc => jc.Journeys)
                .ThenInclude(j => j.Tags)
            .FirstOrDefaultAsync(jc => jc.Id == journeyCategoryId && jc.UserId == user.Id, ct);

        if (journeyCategory == null)
        {
            return TypedResults.NotFound();
        }

        var response = new JourneyCategoryDetailResponse
        {
            Id = journeyCategory.Id,
            Name = journeyCategory.Name,
            Description = journeyCategory.Description,
            CreatedAt = journeyCategory.CreatedAt.ToDateTimeOffset(),
            LastModifiedAt = journeyCategory.LastModifiedAt.ToDateTimeOffset(),
            JourneysCount = journeyCategory.Journeys.Count,
            Journeys = journeyCategory.Journeys.Select(j => new JourneyResponse
            {
                Id = j.Id,
                Name = j.Name,
                Description = j.Description,
                StartDate = j.StartDate?.ToDateOnly(),
                EndDate = j.EndDate?.ToDateOnly(),
                CreatedAt = j.CreatedAt.ToDateTimeOffset(),
                LastModifiedAt = j.LastModifiedAt.ToDateTimeOffset(),
                CategoryId = j.JourneyCategoryId,
                CategoryName = journeyCategory.Name,
                Tags = j.Tags?.Select(t => new Api.DTOs.Tags.TagDto
                {
                    Id = t.Id,
                    Name = t.Name,
                    Color = t.Color
                }).ToList()
            }).ToList()
        };

        return TypedResults.Ok(response);
    }
}
