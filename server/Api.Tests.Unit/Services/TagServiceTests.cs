using Api.Data.Context;
using Api.Data.Entities;
using Api.Services;
using Api.Tests.Unit.Helpers;
using FluentAssertions;
using Xunit;

namespace Api.Tests.Unit.Services;

public class TagServiceTests : IDisposable
{
    private readonly ApplicationContext _context;
    private readonly TagService _sut;

    public TagServiceTests()
    {
        _context = TestDbContextFactory.CreateInMemoryContext();
        _sut = new TagService(_context);
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    [Fact]
    public async Task ValidateAndGetTagsAsync_ShouldReturnEmptyList_WhenNoTagIdsProvided()
    {
        // Arrange
        var userId = Guid.NewGuid();

        // Act
        var result = await _sut.ValidateAndGetTagsAsync(null, userId, CancellationToken.None);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task ValidateAndGetTagsAsync_ShouldReturnOnlyUserTags_WhenMultipleTagsExist()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();
        
        var userTag = TestDataBuilder.CreateTag(userId);
        var otherUserTag = TestDataBuilder.CreateTag(otherUserId);
        var deletedTag = TestDataBuilder.CreateTag(userId, isDeleted: true);
        
        _context.Tags.AddRange(userTag, otherUserTag, deletedTag);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var result = await _sut.ValidateAndGetTagsAsync(
            [userTag.Id, otherUserTag.Id, deletedTag.Id], 
            userId, 
            CancellationToken.None);

        // Assert
        result.Should().HaveCount(1);
        result.Should().Contain(t => t.Id == userTag.Id);
        result.Should().NotContain(t => t.Id == otherUserTag.Id);
        result.Should().NotContain(t => t.Id == deletedTag.Id);
    }

    [Fact]
    public async Task ValidateAndGetTagsAsync_ShouldHandleEmptyTagIdsList()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var emptyList = new List<Guid>();

        // Act
        var result = await _sut.ValidateAndGetTagsAsync(emptyList, userId, CancellationToken.None);

        // Assert
        result.Should().BeEmpty();
    }
    
    [Fact]
    public async Task ValidateAndGetTagsAsync_ShouldReturnOnlyRequestedTags_WhenMultipleUserTagsExist()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var tag1 = TestDataBuilder.CreateTag(userId, "Tag 1");
        var tag2 = TestDataBuilder.CreateTag(userId, "Tag 2");
        var tag3 = TestDataBuilder.CreateTag(userId, "Tag 3");
        
        _context.Tags.AddRange(tag1, tag2, tag3);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var result = await _sut.ValidateAndGetTagsAsync(
            [tag1.Id, tag3.Id], 
            userId, 
            CancellationToken.None);

        // Assert
        result.Should().HaveCount(2);
        result.Should().Contain(t => t.Id == tag1.Id);
        result.Should().Contain(t => t.Id == tag3.Id);
        result.Should().NotContain(t => t.Id == tag2.Id);
    }
    
    [Fact]
    public async Task ValidateAndGetTagsAsync_ShouldHandleCancellationToken()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var cts = new CancellationTokenSource();
        var tag = TestDataBuilder.CreateTag(userId);
        
        _context.Tags.Add(tag);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var resultTask = _sut.ValidateAndGetTagsAsync([tag.Id], userId, cts.Token);
        
        // Assert
        var result = await resultTask;
        result.Should().HaveCount(1);
    }
    
    [Fact]
    public async Task ValidateAndGetTagsAsync_ShouldReturnTagsWithCorrectTailwindColors()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var tag1 = TestDataBuilder.CreateTag(userId, "Red Tag", color: "red");
        var tag2 = TestDataBuilder.CreateTag(userId, "Blue Tag", color: "blue");
        var tag3 = TestDataBuilder.CreateTag(userId, "Emerald Tag", color: "emerald");
        
        _context.Tags.AddRange(tag1, tag2, tag3);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var result = await _sut.ValidateAndGetTagsAsync(
            [tag1.Id, tag2.Id, tag3.Id], 
            userId, 
            CancellationToken.None);

        // Assert
        result.Should().HaveCount(3);
        result.Should().Contain(t => t.Color == "red");
        result.Should().Contain(t => t.Color == "blue");
        result.Should().Contain(t => t.Color == "emerald");
    }
    
    [Fact]
    public async Task ValidateAndGetTagsAsync_ShouldPreserveTimestampProperties()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var createdAt = NodaTimeHelpers.CreateInstant(2024, 1, 15, 10, 30);
        var lastModifiedAt = NodaTimeHelpers.CreateInstant(2024, 1, 16, 14, 45);
        
        var tag = new Tag
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = "Timestamp Test Tag",
            Color = "purple",
            CreatedAt = createdAt,
            LastModifiedAt = lastModifiedAt,
            IsDeleted = false
        };
        
        _context.Tags.Add(tag);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var result = await _sut.ValidateAndGetTagsAsync(
            [tag.Id], 
            userId, 
            CancellationToken.None);

        // Assert
        result.Should().HaveCount(1);
        var retrievedTag = result.First();
        retrievedTag.CreatedAt.Should().Be(createdAt);
        retrievedTag.LastModifiedAt.Should().Be(lastModifiedAt);
    }
    
    [Fact]
    public async Task ValidateAndGetTagsAsync_ShouldRespectDeletedAtTimestamp()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var deletedAt = NodaTimeHelpers.CreateInstant(2024, 1, 20, 9);
        
        var deletedTag = new Tag
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = "Deleted Tag",
            Color = "gray",
            CreatedAt = NodaTimeHelpers.CreateInstant(2024, 1, 10, 8),
            LastModifiedAt = deletedAt,
            IsDeleted = true,
            DeletedAt = deletedAt
        };
        
        _context.Tags.Add(deletedTag);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var result = await _sut.ValidateAndGetTagsAsync(
            [deletedTag.Id], 
            userId, 
            CancellationToken.None);

        // Assert
        result.Should().BeEmpty();
    }
}
