using Api.Data.Context;
using Api.DTOs.Tags;
using Api.Extensions;
using Api.Services;
using NodaTime;

namespace Api.Endpoints.Tags;

public static partial class TagEndpoints
{
    public static async Task<IResult> CreateTagAsync(
        CreateUpdateTagRequest req,
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

        var tag = new Data.Entities.Tag
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Name = req.Name.Trim(),
            Color = req.Color.Trim(),
            CreatedAt = Instant.FromDateTimeUtc(DateTime.UtcNow),
            LastModifiedAt = Instant.FromDateTimeUtc(DateTime.UtcNow)
        };

        context.Tags.Add(tag);
        await context.SaveChangesAsync(ct);

        var createdTag = new CreateUpdateTagResponse
        {
            Id = tag.Id,
            Name = tag.Name,
            Color = tag.Color,
            CreatedAt = tag.CreatedAt.ToDateTimeOffset(),
            LastModifiedAt = tag.LastModifiedAt.ToDateTimeOffset()
        };

        return TypedResults.Created($"/{Routes.Journeys.Base}/{createdTag.Id}", createdTag);
    }
}
