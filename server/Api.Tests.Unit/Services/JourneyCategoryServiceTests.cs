using Api.Data.Context;
using Api.Data.Entities;
using Api.Services;
using Api.Tests.Unit.Helpers;
using FluentAssertions;
using Xunit;

namespace Api.Tests.Unit.Services;

public class JourneyCategoryServiceTests : IDisposable
{
    private readonly JourneyCategoryService _sut;
    private readonly ApplicationContext _context;

    public JourneyCategoryServiceTests()
    {
        _sut = new JourneyCategoryService();
        _context = TestDbContextFactory.CreateInMemoryContext();
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    [Fact]
    public async Task ValidateAndGetCategoryAsync_ShouldReturnNullAndNoError_WhenCategoryIdIsNull()
    {
        // Arrange
        var userId = Guid.NewGuid();

        // Act
        var (category, error) = await _sut.ValidateAndGetCategoryAsync(
            null, userId, _context, CancellationToken.None);

        // Assert
        category.Should().BeNull();
        error.Should().BeNull();
    }

    [Fact]
    public async Task ValidateAndGetCategoryAsync_ShouldReturnError_WhenCategoryIdIsInvalidGuid()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var invalidCategoryId = "not-a-guid";

        // Act
        var (category, error) = await _sut.ValidateAndGetCategoryAsync(
            invalidCategoryId, userId, _context, CancellationToken.None);

        // Assert
        category.Should().BeNull();
        error.Should().Be("Invalid Category ID format.");
    }

    [Fact]
    public async Task ValidateAndGetCategoryAsync_ShouldReturnError_WhenCategoryNotFound()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var categoryId = Guid.NewGuid();
        
        // No categories added to context - it's empty

        // Act
        var (category, error) = await _sut.ValidateAndGetCategoryAsync(
            categoryId.ToString(), userId, _context, CancellationToken.None);

        // Assert
        category.Should().BeNull();
        error.Should().Be("Invalid Category.");
    }

    [Fact]
    public async Task ValidateAndGetCategoryAsync_ShouldReturnError_WhenCategoryBelongsToAnotherUser()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();
        var category = TestDataBuilder.CreateCategory(otherUserId);
        
        _context.JourneyCategories.Add(category);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var (result, error) = await _sut.ValidateAndGetCategoryAsync(
            category.Id.ToString(), userId, _context, CancellationToken.None);

        // Assert
        result.Should().BeNull();
        error.Should().Be("Invalid Category.");
    }

    [Fact]
    public async Task ValidateAndGetCategoryAsync_ShouldReturnCategory_WhenValidCategoryIdProvided()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var category = TestDataBuilder.CreateCategory(userId, "Valid Category");
        
        _context.JourneyCategories.Add(category);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var (result, error) = await _sut.ValidateAndGetCategoryAsync(
            category.Id.ToString(), userId, _context, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(category.Id);
        result.Name.Should().Be("Valid Category");
        error.Should().BeNull();
    }

    [Fact]
    public async Task ValidateAndGetCategoryAsync_ShouldHandleMultipleCategories_AndReturnCorrectOne()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var category1 = TestDataBuilder.CreateCategory(userId, "Category 1");
        var category2 = TestDataBuilder.CreateCategory(userId, "Category 2");
        var category3 = TestDataBuilder.CreateCategory(userId, "Category 3");
        
        _context.JourneyCategories.AddRange(category1, category2, category3);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var (result, error) = await _sut.ValidateAndGetCategoryAsync(
            category2.Id.ToString(), userId, _context, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(category2.Id);
        result.Name.Should().Be("Category 2");
        error.Should().BeNull();
    }

    [Fact]
    public async Task ValidateAndGetCategoryAsync_ShouldHandleCancellationToken()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var category = TestDataBuilder.CreateCategory(userId);
        var cts = new CancellationTokenSource();
        
        _context.JourneyCategories.Add(category);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var resultTask = _sut.ValidateAndGetCategoryAsync(
            category.Id.ToString(), userId, _context, cts.Token);

        // Assert - should complete normally when not cancelled
        var (result, error) = await resultTask;
        result.Should().NotBeNull();
        error.Should().BeNull();
    }
    
    [Fact]
    public async Task ValidateAndGetCategoryAsync_ShouldReturnCategoryWithDescription()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var description = "This is a test category for adventure trips";
        var category = TestDataBuilder.CreateCategory(userId, "Adventure", description);
        
        _context.JourneyCategories.Add(category);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var (result, error) = await _sut.ValidateAndGetCategoryAsync(
            category.Id.ToString(), userId, _context, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Description.Should().Be(description);
        error.Should().BeNull();
    }
    
    [Fact]
    public async Task ValidateAndGetCategoryAsync_ShouldReturnCategoryWithNullDescription()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var category = TestDataBuilder.CreateCategory(userId, "Business", description: null);
        
        _context.JourneyCategories.Add(category);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var (result, error) = await _sut.ValidateAndGetCategoryAsync(
            category.Id.ToString(), userId, _context, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Description.Should().BeNull();
        error.Should().BeNull();
    }
    
    [Fact]
    public async Task ValidateAndGetCategoryAsync_ShouldPreserveTimestampProperties()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var createdAt = NodaTimeHelpers.CreateInstant(2024, 2, 1, 9, 15);
        var lastModifiedAt = NodaTimeHelpers.CreateInstant(2024, 2, 5, 16, 30);
        
        var category = new JourneyCategory
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = "Historical Tours",
            Description = "Categories for historical site visits",
            CreatedAt = createdAt,
            LastModifiedAt = lastModifiedAt
        };
        
        _context.JourneyCategories.Add(category);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var (result, error) = await _sut.ValidateAndGetCategoryAsync(
            category.Id.ToString(), userId, _context, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.CreatedAt.Should().Be(createdAt);
        result.LastModifiedAt.Should().Be(lastModifiedAt);
        error.Should().BeNull();
    }
    
    [Fact]
    public async Task ValidateAndGetCategoryAsync_ShouldHandleMaxLengthDescription()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var maxLengthDescription = new string('A', 500);
        var category = TestDataBuilder.CreateCategory(userId, "Long Description Category", maxLengthDescription);
        
        _context.JourneyCategories.Add(category);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var (result, error) = await _sut.ValidateAndGetCategoryAsync(
            category.Id.ToString(), userId, _context, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Description.Should().HaveLength(500);
        result.Description.Should().Be(maxLengthDescription);
        error.Should().BeNull();
    }
}
