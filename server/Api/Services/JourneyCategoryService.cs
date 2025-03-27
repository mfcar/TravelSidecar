using Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Api.Services;

public interface IJourneyCategoryService
{
    Task<(JourneyCategory? Category, string? Error)> ValidateAndGetCategoryAsync(
        string? categoryId, Guid userId, DbContext context, CancellationToken cancellationToken);
}

public class JourneyCategoryService : IJourneyCategoryService
{
    public async Task<(JourneyCategory? Category, string? Error)> ValidateAndGetCategoryAsync(
        string? categoryId, Guid userId, DbContext context, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(categoryId))
        {
            return (null, null);
        }

        if (!Guid.TryParse(categoryId, out var parsedCategoryId))
        {
            return (null, "Invalid Category ID format.");
        }

        var category = await context.Set<JourneyCategory>()
            .AsNoTracking()
            .FirstOrDefaultAsync(
                c => c.Id == parsedCategoryId && c.UserId == userId,
                cancellationToken);

        if (category == null)
        {
            return (null, "Invalid Category.");
        }

        return (category, null);
    }
}
