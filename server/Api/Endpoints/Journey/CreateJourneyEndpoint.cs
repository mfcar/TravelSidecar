using Api.Builders;
using Api.Data.Context;
using Api.Data.Entities;
using Api.DTOs.Journeys;
using Api.DTOs.Tags;
using Api.Extensions;
using Api.Services;
using Microsoft.AspNetCore.Identity;

namespace Api.Endpoints.Journey;

public static partial class JourneyEndpoints
{
    public static async Task<IResult> CreateJourneyAsync(
        CreateUpdateJourneyRequest req,
        HttpContext httpContext,
        ApplicationContext context,
        UserManager<ApplicationUser> userManager,
        IAuthenticatedUserService authenticatedUserService,
        IJourneyService journeyService,
        IJourneyCategoryService journeyCategoryService,
        ITagService tagService,
        CancellationToken ct)
    {
        var authenticatedUser = await authenticatedUserService.GetUserAsync();
        if (authenticatedUser == null)
        {
            return TypedResults.Unauthorized();
        }

        var (startDate, endDate, dateError) = journeyService.ValidateAndParseDates(
            req.StartYear, req.StartMonth, req.StartDay,
            req.EndYear, req.EndMonth, req.EndDay);

        if (dateError != null)
        {
            return TypedResults.BadRequest(new { Error = dateError });
        }

        var (category, categoryError) =
            await journeyCategoryService.ValidateAndGetCategoryAsync(req.CategoryId, authenticatedUser.Id, context, ct);

        if (categoryError != null)
        {
            return TypedResults.BadRequest(new { Error = categoryError });
        }

        var validTags = await tagService.ValidateAndGetTagsAsync(
            req.TagIds, authenticatedUser.Id, ct);

        var journey = new JourneyBuilder(authenticatedUser.Id, req.Name)
            .WithDescription(req.Description)
            .WithStartDate(startDate)
            .WithEndDate(endDate)
            .WithCategory(category?.Id)
            .WithTags(validTags)
            .Build();

        context.Journeys.Add(journey);
        await context.SaveChangesAsync(ct);

        var journeyResponse = new JourneyResponse
        {
            Id = journey.Id,
            Name = journey.Name,
            Description = journey.Description,
            StartDate = journey.StartDate?.ToDateOnly(),
            EndDate = journey.EndDate?.ToDateOnly(),
            CreatedAt = journey.CreatedAt.ToDateTimeOffset(),
            LastModifiedAt = journey.LastModifiedAt.ToDateTimeOffset(),
            CategoryId = journey.JourneyCategoryId,
            CategoryName = category?.Name ?? string.Empty,
            DaysUntilStart = journeyService.CalculateDaysUntilStartJourney(journey.StartDate),
            JourneyDurationInDays = journeyService.CalculateJourneyDurationInDays(journey.StartDate, journey.EndDate),
            Status = journeyService.CalculateStatus(journey.StartDate, journey.EndDate),
            Tags = journey.Tags.Select(t => new TagDto
            {
                Id = t.Id,
                Name = t.Name,
                Color = t.Color
            }).ToList()
        };

        return TypedResults.Created($"/{Routes.Journeys.Base}/{journeyResponse.Id}", journeyResponse);
    }
}
