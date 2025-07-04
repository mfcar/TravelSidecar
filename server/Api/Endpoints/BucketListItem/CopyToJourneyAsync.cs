using Api.Builders;
using Api.Data.Context;
using Api.Data.Entities;
using Api.DTOs.BucketListItems;
using Api.Enums;
using Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Api.Endpoints.BucketListItem;

public static partial class BucketListItemEndpoints
{
    public static async Task<IResult> CopyToJourneyAsync(
        BucketListToJourneyRequest request,
        HttpContext httpContext,
        ApplicationContext context,
        UserManager<ApplicationUser> userManager,
        IAuthenticatedUserService authenticatedUserService,
        IJourneyService journeyService,
        CancellationToken ct)
    {
        var authenticatedUser = await authenticatedUserService.GetUserAsync();
        if (authenticatedUser == null)
        {
            return TypedResults.Unauthorized();
        }

        // Validate journey exists and belongs to user
        var journey = await context.Journeys
            .FirstOrDefaultAsync(j => j.Id == request.JourneyId && j.UserId == authenticatedUser.Id && !j.IsDeleted, ct);
        if (journey == null)
        {
            return TypedResults.NotFound("Journey not found");
        }

        // Get bucket list items
        var items = await context.BucketListItems
            .Include(b => b.Tags)
            .Where(b => request.ItemIds.Contains(b.Id) && b.UserId == authenticatedUser.Id && !b.IsDeleted)
            .ToListAsync(ct);

        if (items.Count != request.ItemIds.Count)
        {
            return TypedResults.BadRequest("One or more bucket list items not found");
        }

        var createdActivities = new List<JourneyActivity>();

        foreach (var item in items)
        {
            // Create journey activity from bucket list item
            var activity = new JourneyActivity
            {
                Id = Guid.NewGuid(),
                UserId = authenticatedUser.Id,
                JourneyId = request.JourneyId,
                Name = item.Name,
                Description = item.Description,
                Cost = item.OriginalPrice,
                CurrencyCode = item.OriginalCurrencyCode,
                CreatedAt = SystemClock.Instance.GetCurrentInstant(),
                LastModifiedAt = SystemClock.Instance.GetCurrentInstant(),
                IsDeleted = false
            };

            context.Set<JourneyActivity>().Add(activity);
            createdActivities.Add(activity);

            // If move action, mark the bucket list item as deleted
            if (request.Action == BucketListToJourneyAction.Move)
            {
                item.IsDeleted = true;
                item.DeletedAt = SystemClock.Instance.GetCurrentInstant();
            }
        }

        await context.SaveChangesAsync(ct);

        return TypedResults.Ok(new
        {
            Message = $"Successfully {(request.Action == BucketListToJourneyAction.Move ? "moved" : "copied")} {createdActivities.Count} items to journey",
            CreatedActivityIds = createdActivities.Select(a => a.Id).ToList()
        });
    }
}