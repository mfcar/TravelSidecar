using Api.Builders;
using Api.Data.Context;
using Api.Data.Entities;
using Api.DTOs.BucketListItems;
using Api.DTOs.Tags;
using Api.Extensions;
using Api.Services;
using Microsoft.AspNetCore.Identity;

namespace Api.Endpoints.BucketListItem;

public static partial class BucketListItemEndpoints
{
    public static async Task<IResult> CreateBucketListItemAsync(
        CreateUpdateBucketListItemRequest req,
        HttpContext httpContext,
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
        
        var validTags = await tagService.ValidateAndGetTagsAsync(
            req.TagIds, authenticatedUser.Id, ct);
        
        var builder = new BucketListItemBuilder(
                authenticatedUser.Id, 
                req.Name, 
                req.Description, 
                req.Type)
            .WithBucketListId(req.BucketListId)
            .WithStartDate(req.StartDate)
            .WithStartTime(req.StartTime, req.StartTimeZoneId)
            .WithEndDate(req.EndDate)
            .WithEndTime(req.EndTime, req.EndTimeZoneId)
            .WithPrice(req.OriginalPrice, req.OriginalCurrencyCode)
            .WithTags(validTags);
        
        var bucketListItem = builder.Build();
        
        context.BucketListItems.Add(bucketListItem);
        await context.SaveChangesAsync(ct);
        
        var response = new CreateUpdateBucketListItemResponse
        {
            Id = bucketListItem.Id,
            Name = bucketListItem.Name,
            Description = bucketListItem.Description,
            Type = bucketListItem.Type,
            BucketListId = bucketListItem.BucketListId,
            StartDate = bucketListItem.StartDate,
            StartTimeUtc = bucketListItem.StartTimeUtc,
            StartTimeZoneId = bucketListItem.StartTimeZoneId,
            EndDate = bucketListItem.EndDate,
            EndTimeUtc = bucketListItem.EndTimeUtc,
            EndTimeZoneId = bucketListItem.EndTimeZoneId,
            OriginalPrice = bucketListItem.OriginalPrice,
            OriginalCurrencyCode = bucketListItem.OriginalCurrencyCode,
            CreatedAt = bucketListItem.CreatedAt.ToDateTimeOffset(),
            Tags = bucketListItem.Tags.Select(t => new TagDto
            {
                Id = t.Id,
                Name = t.Name,
                Color = t.Color
            }).ToList()
        };
        
        return TypedResults.Created($"/{Routes.BucketListItems.Base}/{response.Id}", response);
    }
}
