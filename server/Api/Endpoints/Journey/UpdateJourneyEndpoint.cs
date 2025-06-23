using Api.Data.Context;
using Api.DTOs.Journeys;
using Api.Services;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Api.Endpoints.Journey;

public static partial class JourneyEndpoints
{
    public static async Task<IResult> UpdateJourneyAsync(
        Guid journeyId,
        CreateUpdateJourneyRequest req,
        ApplicationContext context,
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

        var journey = await context.Journeys
            .Include(j => j.Tags)
            .Where(j => j.UserId == authenticatedUser.Id && j.Id == journeyId)
            .FirstOrDefaultAsync(ct);

        if (journey == null)
        {
            return TypedResults.NotFound(new { Error = "Journey not found." });
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

        journey.Name = req.Name;
        journey.Description = req.Description;
        journey.StartDate = startDate;
        journey.EndDate = endDate;
        journey.JourneyCategoryId = category?.Id;
        journey.LastModifiedAt = Instant.FromDateTimeUtc(DateTime.UtcNow);

        journey.Tags.Clear();
        foreach (var tag in validTags)
        {
            journey.Tags.Add(tag);
        }

        context.Journeys.Update(journey);
        await context.SaveChangesAsync(ct);

        return TypedResults.NoContent();
    }
}
