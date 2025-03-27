using Api.Data.Context;
using Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Api.Services;

public interface IBucketListService
{
    Task<(BucketList? BucketList, string? Error)> ValidateAndGetBucketListAsync(
        Guid? bucketListId, Guid userId, CancellationToken cancellationToken);
}

public class BucketListService : IBucketListService
{
    private readonly ApplicationContext _context;

    public BucketListService(ApplicationContext context)
    {
        _context = context;
    }

    public async Task<(BucketList? BucketList, string? Error)> ValidateAndGetBucketListAsync(
        Guid? bucketListId, Guid userId, CancellationToken cancellationToken)
    {
        if (bucketListId == null)
        {
            return (null, null);
        }

        var bucketList = await _context.Set<BucketList>()
            .FirstOrDefaultAsync(
                b => b.Id == bucketListId && b.UserId == userId,
                cancellationToken);

        if (bucketList == null)
        {
            return (null, "Invalid Bucket List.");
        }

        return (bucketList, null);
    }
}
