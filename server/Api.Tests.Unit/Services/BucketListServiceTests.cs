using Api.Data.Context;
using Api.Data.Entities;
using Api.Services;
using Api.Tests.Unit.Helpers;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Api.Tests.Unit.Services;

public class BucketListServiceTests : IDisposable
{
    private readonly ApplicationContext _context;
    private readonly BucketListService _sut;

    public BucketListServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _context = new ApplicationContext(options);
        _sut = new BucketListService(_context);
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    [Fact]
    public async Task ValidateAndGetBucketListAsync_ShouldReturnNullBucketListAndNullError_WhenBucketListIdIsNull()
    {
        // Arrange
        var userId = Guid.NewGuid();

        // Act
        var (bucketList, error) = await _sut.ValidateAndGetBucketListAsync(null, userId, TestContext.Current.CancellationToken);

        // Assert
        bucketList.Should().BeNull();
        error.Should().BeNull();
    }

    [Fact]
    public async Task ValidateAndGetBucketListAsync_ShouldReturnBucketList_WhenBucketListBelongsToUser()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var bucketList = TestDataBuilder.CreateBucketList(userId, "My Travel Goals");
        _context.Set<BucketList>().Add(bucketList);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var (result, error) = await _sut.ValidateAndGetBucketListAsync(bucketList.Id, userId, TestContext.Current.CancellationToken);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(bucketList.Id);
        result.UserId.Should().Be(userId);
        result.Name.Should().Be("My Travel Goals");
        error.Should().BeNull();
    }

    [Fact]
    public async Task ValidateAndGetBucketListAsync_ShouldReturnNullAndError_WhenBucketListDoesNotExist()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var nonExistentId = Guid.NewGuid();

        // Act
        var (bucketList, error) = await _sut.ValidateAndGetBucketListAsync(nonExistentId, userId, TestContext.Current.CancellationToken);

        // Assert
        bucketList.Should().BeNull();
        error.Should().Be("Invalid Bucket List.");
    }

    [Fact]
    public async Task ValidateAndGetBucketListAsync_ShouldReturnNullAndError_WhenBucketListBelongsToAnotherUser()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var anotherUserId = Guid.NewGuid();
        var bucketList = TestDataBuilder.CreateBucketList(anotherUserId, "Another User's List");
        _context.Set<BucketList>().Add(bucketList);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var (result, error) = await _sut.ValidateAndGetBucketListAsync(bucketList.Id, userId, TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeNull();
        error.Should().Be("Invalid Bucket List.");
    }

    [Fact]
    public async Task ValidateAndGetBucketListAsync_ShouldReturnNullAndError_WhenBucketListIsDeleted()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var bucketList = new BucketList
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = "Deleted List",
            CreatedAt = NodaTime.Instant.FromDateTimeUtc(DateTime.UtcNow),
            LastModifiedAt = NodaTime.Instant.FromDateTimeUtc(DateTime.UtcNow),
            IsDeleted = true,
            DeletedAt = NodaTime.Instant.FromDateTimeUtc(DateTime.UtcNow)
        };
        _context.Set<BucketList>().Add(bucketList);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var (result, error) = await _sut.ValidateAndGetBucketListAsync(bucketList.Id, userId, TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeNull();
        error.Should().Be("Invalid Bucket List.");
    }

    [Fact]
    public async Task ValidateAndGetBucketListAsync_ShouldHandleConcurrentAccess()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var bucketList = TestDataBuilder.CreateBucketList(userId, "Concurrent Test");
        _context.Set<BucketList>().Add(bucketList);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var tasks = new List<Task<(Data.Entities.BucketList?, string?)>>();
        for (int i = 0; i < 10; i++)
        {
            tasks.Add(_sut.ValidateAndGetBucketListAsync(bucketList.Id, userId, TestContext.Current.CancellationToken));
        }
        var results = await Task.WhenAll(tasks);

        // Assert
        results.Should().HaveCount(10);
        results.Should().AllSatisfy(r =>
        {
            r.Item1.Should().NotBeNull();
            r.Item1!.Id.Should().Be(bucketList.Id);
            r.Item2.Should().BeNull();
        });
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData("A")]
    [InlineData("This is a very long bucket list name that might exceed some reasonable length expectations")]
    public async Task ValidateAndGetBucketListAsync_ShouldHandleVariousBucketListNames(string name)
    {
        // Arrange
        var userId = Guid.NewGuid();
        var bucketList = TestDataBuilder.CreateBucketList(userId, name);
        _context.Set<BucketList>().Add(bucketList);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var (result, error) = await _sut.ValidateAndGetBucketListAsync(bucketList.Id, userId, TestContext.Current.CancellationToken);

        // Assert
        result.Should().NotBeNull();
        result!.Name.Should().Be(name);
        error.Should().BeNull();
    }
}
