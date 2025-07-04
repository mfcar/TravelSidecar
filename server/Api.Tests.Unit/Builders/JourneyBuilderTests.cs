using Api.Builders;
using Api.Tests.Unit.Helpers;
using FluentAssertions;
using NodaTime;
using Xunit;

namespace Api.Tests.Unit.Builders;

public class JourneyBuilderTests
{
    [Fact]
    public void Build_ShouldCreateJourneyWithRequiredFields()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var title = "My Amazing Trip";
        
        // Act
        var journey = new JourneyBuilder(userId, title).Build();
        
        // Assert
        journey.Should().NotBeNull();
        journey.UserId.Should().Be(userId);
        journey.Name.Should().Be(title);
        journey.Tags.Should().BeEmpty();
        journey.CreatedAt.Should().NotBe(Instant.MinValue);
        journey.LastModifiedAt.Should().NotBe(Instant.MinValue);
    }
    
    [Fact]
    public void WithDescription_ShouldSetDescription()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var title = "European Adventure";
        var description = "A month-long tour of Europe's most beautiful cities";
        
        // Act
        var journey = new JourneyBuilder(userId, title)
            .WithDescription(description)
            .Build();
        
        // Assert
        journey.Description.Should().Be(description);
    }
    
    [Fact]
    public void WithDescription_ShouldTrimWhitespace()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var title = "Beach Vacation";
        var description = "  Relaxing on tropical beaches  ";
        
        // Act
        var journey = new JourneyBuilder(userId, title)
            .WithDescription(description)
            .Build();
        
        // Assert
        journey.Description.Should().Be("Relaxing on tropical beaches");
    }
    
    [Fact]
    public void WithDescription_ShouldHandleNull()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var title = "Business Trip";
        
        // Act
        var journey = new JourneyBuilder(userId, title)
            .WithDescription(null)
            .Build();
        
        // Assert
        journey.Description.Should().BeNull();
    }
    
    [Fact]
    public void WithStartDate_ShouldSetStartDate()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var title = "Summer Vacation";
        var startDate = new LocalDate(2024, 7, 15);
        
        // Act
        var journey = new JourneyBuilder(userId, title)
            .WithStartDate(startDate)
            .Build();
        
        // Assert
        journey.StartDate.Should().Be(startDate);
    }
    
    [Fact]
    public void WithEndDate_ShouldSetEndDate_WhenStartDateIsSet()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var title = "Weekend Getaway";
        var startDate = new LocalDate(2024, 8, 10);
        var endDate = new LocalDate(2024, 8, 12);
        
        // Act
        var journey = new JourneyBuilder(userId, title)
            .WithStartDate(startDate)
            .WithEndDate(endDate)
            .Build();
        
        // Assert
        journey.StartDate.Should().Be(startDate);
        journey.EndDate.Should().Be(endDate);
    }
    
    [Fact]
    public void WithEndDate_ShouldThrowException_WhenStartDateNotSet()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var title = "Invalid Journey";
        var endDate = new LocalDate(2024, 8, 12);
        
        // Act
        var act = () => new JourneyBuilder(userId, title)
            .WithEndDate(endDate)
            .Build();
        
        // Assert
        act.Should().Throw<InvalidOperationException>()
            .WithMessage("StartDate must be set before setting EndDate.");
    }
    
    [Fact]
    public void WithCategory_ShouldSetCategoryId()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var title = "Cultural Tour";
        var categoryId = Guid.NewGuid();
        
        // Act
        var journey = new JourneyBuilder(userId, title)
            .WithCategory(categoryId)
            .Build();
        
        // Assert
        journey.JourneyCategoryId.Should().Be(categoryId);
    }
    
    [Fact]
    public void WithCategory_ShouldHandleNullCategoryId()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var title = "Uncategorized Trip";
        
        // Act
        var journey = new JourneyBuilder(userId, title)
            .WithCategory(null)
            .Build();
        
        // Assert
        journey.JourneyCategoryId.Should().BeNull();
    }
    
    [Fact]
    public void WithTags_ShouldAddTagsToJourney()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var title = "Adventure Trip";
        var tag1 = TestDataBuilder.CreateTag(userId, "Hiking", color: "green");
        var tag2 = TestDataBuilder.CreateTag(userId, "Mountains", color: "blue");
        var tags = new[] { tag1, tag2 };
        
        // Act
        var journey = new JourneyBuilder(userId, title)
            .WithTags(tags)
            .Build();
        
        // Assert
        journey.Tags.Should().HaveCount(2);
        journey.Tags.Should().Contain(tag1);
        journey.Tags.Should().Contain(tag2);
    }
    
    [Fact]
    public void WithTags_ShouldHandleEmptyTagsList()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var title = "Solo Trip";
        
        // Act
        var journey = new JourneyBuilder(userId, title)
            .WithTags([])
            .Build();
        
        // Assert
        journey.Tags.Should().BeEmpty();
    }
    
    [Fact]
    public void WithTags_ShouldHandleNullTagsList()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var title = "Quick Trip";
        
        // Act
        var journey = new JourneyBuilder(userId, title)
            .WithTags(null)
            .Build();
        
        // Assert
        journey.Tags.Should().BeEmpty();
    }
    
    [Fact]
    public void FluentApi_ShouldAllowChaining()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var title = "Complete Journey";
        var description = "A fully configured journey";
        var startDate = new LocalDate(2024, 9, 1);
        var endDate = new LocalDate(2024, 9, 15);
        var categoryId = Guid.NewGuid();
        var tag = TestDataBuilder.CreateTag(userId, "Europe", color: "blue");
        
        // Act
        var journey = new JourneyBuilder(userId, title)
            .WithDescription(description)
            .WithStartDate(startDate)
            .WithEndDate(endDate)
            .WithCategory(categoryId)
            .WithTags([tag])
            .Build();
        
        // Assert
        journey.UserId.Should().Be(userId);
        journey.Name.Should().Be(title);
        journey.Description.Should().Be(description);
        journey.StartDate.Should().Be(startDate);
        journey.EndDate.Should().Be(endDate);
        journey.JourneyCategoryId.Should().Be(categoryId);
        journey.Tags.Should().ContainSingle();
        journey.Tags.First().Name.Should().Be("Europe");
    }
}
