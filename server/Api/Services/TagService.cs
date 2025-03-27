using Api.Data.Context;
using Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Api.Services;

public interface ITagService
{
    Task<List<Tag>> ValidateAndGetTagsAsync(
        IEnumerable<Guid>? tagIds, Guid userId, CancellationToken cancellationToken);
}

public class TagService : ITagService
{
    private readonly ApplicationContext _context;

    public TagService(ApplicationContext context)
    {
        _context = context;
    }

    public async Task<List<Tag>> ValidateAndGetTagsAsync(
        IEnumerable<Guid>? tagIds, Guid userId, CancellationToken cancellationToken)
    {
        var tagIdsList = tagIds?.ToList() ?? [];
        if (tagIdsList.Count == 0)
        {
            return [];
        }
    
        var foundTags = await _context.Tags
            .Where(t => tagIdsList.Contains(t.Id) && t.UserId == userId && !t.IsDeleted)
            .ToListAsync(cancellationToken);

        return foundTags;
    }
}
