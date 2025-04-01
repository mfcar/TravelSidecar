using Api.Data.Context;
using Api.Data.Entities;
using Api.DTOs.BucketListItems;
using Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NodaTime;
using NodaTime.Text;

namespace Api.Endpoints.BucketListItem;

public static partial class BucketListItemEndpoints
{
    public static async Task<IResult> UpdateBucketListItemAsync(
        Guid bucketListItemId,
        CreateUpdateBucketListItemRequest req,
        ApplicationContext context,
        UserManager<ApplicationUser> userManager,
        IAuthenticatedUserService authenticatedUserService,
        IBucketListService bucketListService,
        ITagService tagService,
        CancellationToken ct)
    {
        var authenticatedUser = await authenticatedUserService.GetUserAsync();
        if (authenticatedUser == null)
        {
            return TypedResults.Unauthorized();
        }

        var bucketListItem = await context.BucketListItems
            .Include(b => b.Tags)
            .FirstOrDefaultAsync(b => b.Id == bucketListItemId, ct);
            
        if (bucketListItem == null)
        {
            return TypedResults.NotFound();
        }

        if (bucketListItem.UserId != authenticatedUser.Id)
        {
            var isAdmin = await userManager.IsInRoleAsync(authenticatedUser, "Admin");
            if (!isAdmin)
            {
                return TypedResults.Forbid();
            }
        }

        if (req.BucketListId.HasValue)
        {
            var (_, error) = await bucketListService.ValidateAndGetBucketListAsync(
                req.BucketListId.Value, authenticatedUser.Id, ct);
            
            if (error != null)
            {
                return TypedResults.BadRequest(error);
            }
        }
        
        if (req.OriginalPrice.HasValue && string.IsNullOrEmpty(req.OriginalCurrencyCode))
        {
            return TypedResults.BadRequest("Currency code is required when price is specified.");
        }
        
        bucketListItem.Name = req.Name;
        bucketListItem.Description = req.Description;
        bucketListItem.Type = req.Type;
        bucketListItem.BucketListId = req.BucketListId;
        bucketListItem.StartDate = req.StartDate;
        bucketListItem.EndDate = req.EndDate;
        if (req.OriginalPrice.HasValue && !string.IsNullOrEmpty(req.OriginalCurrencyCode))
        {
            bucketListItem.OriginalPrice = req.OriginalPrice;
            bucketListItem.OriginalCurrencyCode = req.OriginalCurrencyCode;
        }
        else
        {
            bucketListItem.OriginalPrice = null;
            bucketListItem.OriginalCurrencyCode = null;
        }
        bucketListItem.UpdatedAt = Instant.FromDateTimeUtc(DateTime.UtcNow);
        
        if (!string.IsNullOrEmpty(req.StartTime) && bucketListItem.StartDate.HasValue)
        {
            var timeZone = !string.IsNullOrEmpty(req.StartTimeZoneId)
                ? DateTimeZoneProviders.Tzdb[req.StartTimeZoneId]
                : DateTimeZoneProviders.Tzdb.GetSystemDefault();
            
            var localTimePattern = LocalTimePattern.CreateWithInvariantCulture("HH:mm");
            if (localTimePattern.Parse(req.StartTime).Success)
            {
                var localTime = localTimePattern.Parse(req.StartTime).Value;
                var localDateTime = new LocalDateTime(
                    bucketListItem.StartDate.Value.Year,
                    bucketListItem.StartDate.Value.Month,
                    bucketListItem.StartDate.Value.Day,
                    localTime.Hour,
                    localTime.Minute);
                
                bucketListItem.StartTimeUtc = localDateTime.InZoneStrictly(timeZone).ToInstant();
                bucketListItem.StartTimeZoneId = req.StartTimeZoneId;
            }
        }
        else
        {
            bucketListItem.StartTimeUtc = null;
            bucketListItem.StartTimeZoneId = null;
        }
        
        if (!string.IsNullOrEmpty(req.EndTime) && bucketListItem.EndDate.HasValue)
        {
            var timeZone = !string.IsNullOrEmpty(req.EndTimeZoneId)
                ? DateTimeZoneProviders.Tzdb[req.EndTimeZoneId]
                : DateTimeZoneProviders.Tzdb.GetSystemDefault();
            
            var localTimePattern = LocalTimePattern.CreateWithInvariantCulture("HH:mm");
            if (localTimePattern.Parse(req.EndTime).Success)
            {
                var localTime = localTimePattern.Parse(req.EndTime).Value;
                var localDateTime = new LocalDateTime(
                    bucketListItem.EndDate.Value.Year,
                    bucketListItem.EndDate.Value.Month,
                    bucketListItem.EndDate.Value.Day,
                    localTime.Hour,
                    localTime.Minute);
                
                bucketListItem.EndTimeUtc = localDateTime.InZoneStrictly(timeZone).ToInstant();
                bucketListItem.EndTimeZoneId = req.EndTimeZoneId;
            }
        }
        else
        {
            bucketListItem.EndTimeUtc = null;
            bucketListItem.EndTimeZoneId = null;
        }
        
        var validTags = await tagService.ValidateAndGetTagsAsync(
            req.TagIds, authenticatedUser.Id, ct);
        bucketListItem.Tags.Clear();
        foreach (var tag in validTags)
        {
            bucketListItem.Tags.Add(tag);
        }
        
        await context.SaveChangesAsync(ct);
        
        return TypedResults.NoContent();
    }
}
