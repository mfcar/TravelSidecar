using Api.Builders;
using Api.Enums;
using Api.Tests.Unit.Helpers;
using FluentAssertions;
using NodaTime;
using Xunit;

namespace Api.Tests.Unit.Builders;

public class BucketListItemBuilderTests
{
    [Fact]
    public void Build_ShouldCreateBucketListItemWithRequiredFields()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var name = "Visit Tokyo";
        var description = "Experience Japanese culture";
        var type = BucketListItemType.Place;
        
        // Act
        var bucketListItem = new BucketListItemBuilder(userId, name, description, type).Build();
        
        // Assert
        bucketListItem.Should().NotBeNull();
        bucketListItem.UserId.Should().Be(userId);
        bucketListItem.Name.Should().Be(name);
        bucketListItem.Description.Should().Be(description);
        bucketListItem.Type.Should().Be(type);
        bucketListItem.Tags.Should().BeEmpty();
    }

    [Fact]
    public void Build_ShouldHandleNullDescription()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var name = "Skydiving Adventure";
        string? description = null;
        var type = BucketListItemType.Adventure;
        
        // Act
        var bucketListItem = new BucketListItemBuilder(userId, name, description, type).Build();
        
        // Assert
        bucketListItem.Description.Should().BeNull();
    }

    [Fact]
    public void WithBucketListId_ShouldSetBucketListId()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var bucketListId = Guid.NewGuid();
        
        // Act
        var bucketListItem = new BucketListItemBuilder(userId, "Test Item", null, BucketListItemType.Place)
            .WithBucketListId(bucketListId)
            .Build();
        
        // Assert
        bucketListItem.BucketListId.Should().Be(bucketListId);
    }

    [Fact]
    public void WithBucketListId_ShouldHandleNullBucketListId()
    {
        // Arrange
        var userId = Guid.NewGuid();
        
        // Act
        var bucketListItem = new BucketListItemBuilder(userId, "Test Item", null, BucketListItemType.Place)
            .WithBucketListId(null)
            .Build();
        
        // Assert
        bucketListItem.BucketListId.Should().BeNull();
    }

    [Fact]
    public void WithStartDate_ShouldSetStartDate()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var startDate = new LocalDate(2024, 12, 25);
        
        // Act
        var bucketListItem = new BucketListItemBuilder(userId, "Christmas Trip", null, BucketListItemType.Place)
            .WithStartDate(startDate)
            .Build();
        
        // Assert
        bucketListItem.StartDate.Should().Be(startDate);
    }

    [Fact]
    public void WithStartDate_ShouldHandleNullStartDate()
    {
        // Arrange
        var userId = Guid.NewGuid();
        
        // Act
        var bucketListItem = new BucketListItemBuilder(userId, "Flexible Trip", null, BucketListItemType.Place)
            .WithStartDate(null)
            .Build();
        
        // Assert
        bucketListItem.StartDate.Should().BeNull();
    }

    [Fact]
    public void WithEndDate_ShouldSetEndDate()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var endDate = new LocalDate(2024, 12, 31);
        
        // Act
        var bucketListItem = new BucketListItemBuilder(userId, "New Year Trip", null, BucketListItemType.Place)
            .WithEndDate(endDate)
            .Build();
        
        // Assert
        bucketListItem.EndDate.Should().Be(endDate);
    }

    [Fact]
    public void WithEndDate_ShouldHandleNullEndDate()
    {
        // Arrange
        var userId = Guid.NewGuid();
        
        // Act
        var bucketListItem = new BucketListItemBuilder(userId, "Open-ended Trip", null, BucketListItemType.Place)
            .WithEndDate(null)
            .Build();
        
        // Assert
        bucketListItem.EndDate.Should().BeNull();
    }

    [Fact]
    public void WithStartTime_ShouldSetStartTimeAndTimezone()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var startDate = new LocalDate(2024, 7, 15);
        var timeString = "10:30";
        var timeZoneId = "America/New_York";
        
        // Act
        var bucketListItem = new BucketListItemBuilder(userId, "Morning Event", null, BucketListItemType.Adventure)
            .WithStartDate(startDate)
            .WithStartTime(timeString, timeZoneId)
            .Build();
        
        // Assert
        bucketListItem.StartTimeUtc.Should().NotBeNull();
        bucketListItem.StartTimeZoneId.Should().Be(timeZoneId);
    }

    [Fact]
    public void WithStartTime_ShouldUseSystemTimezone_WhenTimezoneIdIsNull()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var startDate = new LocalDate(2024, 7, 15);
        var timeString = "14:00";
        
        // Act
        var bucketListItem = new BucketListItemBuilder(userId, "Afternoon Event", null, BucketListItemType.Adventure)
            .WithStartDate(startDate)
            .WithStartTime(timeString, null)
            .Build();
        
        // Assert
        bucketListItem.StartTimeUtc.Should().NotBeNull();
        bucketListItem.StartTimeZoneId.Should().BeNull();
    }

    [Fact]
    public void WithStartTime_ShouldSetStartDateToToday_WhenStartDateIsNull()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var timeString = "09:00";
        var timeZoneId = "UTC";
        
        // Act
        var bucketListItem = new BucketListItemBuilder(userId, "Quick Event", null, BucketListItemType.Adventure)
            .WithStartTime(timeString, timeZoneId)
            .Build();
        
        // Assert
        bucketListItem.StartDate.Should().NotBeNull();
        bucketListItem.StartDate.Should().Be(LocalDate.FromDateTime(DateTime.Today));
        bucketListItem.StartTimeUtc.Should().NotBeNull();
    }

    [Fact]
    public void WithStartTime_ShouldIgnoreInvalidTimeFormat()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var startDate = new LocalDate(2024, 7, 15);
        var invalidTimeString = "25:70"; // Invalid time
        
        // Act
        var bucketListItem = new BucketListItemBuilder(userId, "Event", null, BucketListItemType.Adventure)
            .WithStartDate(startDate)
            .WithStartTime(invalidTimeString, "UTC")
            .Build();
        
        // Assert
        bucketListItem.StartTimeUtc.Should().BeNull();
        bucketListItem.StartTimeZoneId.Should().BeNull();
    }

    [Fact]
    public void WithStartTime_ShouldIgnoreEmptyTimeString()
    {
        // Arrange
        var userId = Guid.NewGuid();
        
        // Act
        var bucketListItem = new BucketListItemBuilder(userId, "Event", null, BucketListItemType.Adventure)
            .WithStartTime("", "UTC")
            .Build();
        
        // Assert
        bucketListItem.StartTimeUtc.Should().BeNull();
        bucketListItem.StartTimeZoneId.Should().BeNull();
    }

    [Fact]
    public void WithEndTime_ShouldSetEndTimeAndTimezone()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var endDate = new LocalDate(2024, 7, 15);
        var timeString = "18:00";
        var timeZoneId = "Europe/London";
        
        // Act
        var bucketListItem = new BucketListItemBuilder(userId, "Evening Event", null, BucketListItemType.Adventure)
            .WithEndDate(endDate)
            .WithEndTime(timeString, timeZoneId)
            .Build();
        
        // Assert
        bucketListItem.EndTimeUtc.Should().NotBeNull();
        bucketListItem.EndTimeZoneId.Should().Be(timeZoneId);
    }

    [Fact]
    public void WithEndTime_ShouldSetEndDateToToday_WhenEndDateIsNull()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var timeString = "23:59";
        
        // Act
        var bucketListItem = new BucketListItemBuilder(userId, "Late Event", null, BucketListItemType.Adventure)
            .WithEndTime(timeString, "UTC")
            .Build();
        
        // Assert
        bucketListItem.EndDate.Should().NotBeNull();
        bucketListItem.EndDate.Should().Be(LocalDate.FromDateTime(DateTime.Today));
        bucketListItem.EndTimeUtc.Should().NotBeNull();
    }

    [Fact]
    public void WithEndTime_ShouldIgnoreInvalidTimeFormat()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var endDate = new LocalDate(2024, 7, 15);
        var invalidTimeString = "abc:def";
        
        // Act
        var bucketListItem = new BucketListItemBuilder(userId, "Event", null, BucketListItemType.Adventure)
            .WithEndDate(endDate)
            .WithEndTime(invalidTimeString, "UTC")
            .Build();
        
        // Assert
        bucketListItem.EndTimeUtc.Should().BeNull();
        bucketListItem.EndTimeZoneId.Should().BeNull();
    }

    [Fact]
    public void WithPrice_ShouldSetPriceAndCurrency()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var price = 1500.50m;
        var currencyCode = "EUR";
        
        // Act
        var bucketListItem = new BucketListItemBuilder(userId, "Expensive Trip", null, BucketListItemType.Place)
            .WithPrice(price, currencyCode)
            .Build();
        
        // Assert
        bucketListItem.OriginalPrice.Should().Be(price);
        bucketListItem.OriginalCurrencyCode.Should().Be(currencyCode);
    }

    [Fact]
    public void WithPrice_ShouldIgnorePriceWithoutCurrency()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var price = 1000.00m;
        
        // Act
        var bucketListItem = new BucketListItemBuilder(userId, "Trip", null, BucketListItemType.Place)
            .WithPrice(price, null)
            .Build();
        
        // Assert
        bucketListItem.OriginalPrice.Should().BeNull();
    }

    [Fact]
    public void WithPrice_ShouldIgnoreCurrencyWithoutPrice()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var currencyCode = "USD";
        
        // Act
        var bucketListItem = new BucketListItemBuilder(userId, "Trip", null, BucketListItemType.Place)
            .WithPrice(null, currencyCode)
            .Build();
        
        // Assert
        bucketListItem.OriginalPrice.Should().BeNull();
    }

    [Fact]
    public void WithTags_ShouldAddTagsToBucketListItem()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var tag1 = TestDataBuilder.CreateTag(userId, "Adventure", color: "red");
        var tag2 = TestDataBuilder.CreateTag(userId, "Europe", color: "blue");
        var tags = new[] { tag1, tag2 };
        
        // Act
        var bucketListItem = new BucketListItemBuilder(userId, "European Adventure", null, BucketListItemType.Place)
            .WithTags(tags)
            .Build();
        
        // Assert
        bucketListItem.Tags.Should().HaveCount(2);
        bucketListItem.Tags.Should().Contain(tag1);
        bucketListItem.Tags.Should().Contain(tag2);
    }

    [Fact]
    public void WithTags_ShouldHandleEmptyTagsList()
    {
        // Arrange
        var userId = Guid.NewGuid();
        
        // Act
        var bucketListItem = new BucketListItemBuilder(userId, "Solo Trip", null, BucketListItemType.Place)
            .WithTags([])
            .Build();
        
        // Assert
        bucketListItem.Tags.Should().BeEmpty();
    }

    [Fact]
    public void WithTags_ShouldHandleNullTagsList()
    {
        // Arrange
        var userId = Guid.NewGuid();
        
        // Act
        var bucketListItem = new BucketListItemBuilder(userId, "Quick Trip", null, BucketListItemType.Place)
            .WithTags(null)
            .Build();
        
        // Assert
        bucketListItem.Tags.Should().BeEmpty();
    }

    [Fact]
    public void FluentApi_ShouldAllowMethodChaining()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var bucketListId = Guid.NewGuid();
        var startDate = new LocalDate(2024, 8, 1);
        var endDate = new LocalDate(2024, 8, 7);
        var price = 2500.00m;
        var tag = TestDataBuilder.CreateTag(userId, "Luxury", color: "purple");
        
        // Act
        var bucketListItem = new BucketListItemBuilder(userId, "Luxury Vacation", "Five-star resort experience", BucketListItemType.Place)
            .WithBucketListId(bucketListId)
            .WithStartDate(startDate)
            .WithEndDate(endDate)
            .WithStartTime("10:00", "UTC")
            .WithEndTime("18:00", "UTC")
            .WithPrice(price, "USD")
            .WithTags([tag])
            .Build();
        
        // Assert
        bucketListItem.UserId.Should().Be(userId);
        bucketListItem.Name.Should().Be("Luxury Vacation");
        bucketListItem.Description.Should().Be("Five-star resort experience");
        bucketListItem.Type.Should().Be(BucketListItemType.Place);
        bucketListItem.BucketListId.Should().Be(bucketListId);
        bucketListItem.StartDate.Should().Be(startDate);
        bucketListItem.EndDate.Should().Be(endDate);
        bucketListItem.StartTimeUtc.Should().NotBeNull();
        bucketListItem.EndTimeUtc.Should().NotBeNull();
        bucketListItem.OriginalPrice.Should().Be(price);
        bucketListItem.OriginalCurrencyCode.Should().Be("USD");
        bucketListItem.Tags.Should().ContainSingle();
        bucketListItem.Tags.First().Name.Should().Be("Luxury");
    }

    [Theory]
    [InlineData(BucketListItemType.Place)]
    [InlineData(BucketListItemType.Adventure)]
    [InlineData(BucketListItemType.Food)]
    public void Build_ShouldSupportAllBucketListItemTypes(BucketListItemType type)
    {
        // Arrange
        var userId = Guid.NewGuid();
        var name = $"Test {type}";
        
        // Act
        var bucketListItem = new BucketListItemBuilder(userId, name, null, type).Build();
        
        // Assert
        bucketListItem.Type.Should().Be(type);
        bucketListItem.Name.Should().Be(name);
    }

    [Fact]
    public void WithStartTime_ShouldHandleEdgeTimeValues()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var startDate = new LocalDate(2024, 7, 15);
        
        // Act & Assert - Test midnight
        var bucketListItem1 = new BucketListItemBuilder(userId, "Midnight Event", null, BucketListItemType.Adventure)
            .WithStartDate(startDate)
            .WithStartTime("00:00", "UTC")
            .Build();
        
        bucketListItem1.StartTimeUtc.Should().NotBeNull();
        
        // Act & Assert - Test just before midnight
        var bucketListItem2 = new BucketListItemBuilder(userId, "Late Event", null, BucketListItemType.Adventure)
            .WithStartDate(startDate)
            .WithStartTime("23:59", "UTC")
            .Build();
        
        bucketListItem2.StartTimeUtc.Should().NotBeNull();
    }

    [Fact]
    public void WithPrice_ShouldHandleZeroPrice()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var price = 0.00m;
        var currencyCode = "USD";
        
        // Act
        var bucketListItem = new BucketListItemBuilder(userId, "Free Activity", null, BucketListItemType.Adventure)
            .WithPrice(price, currencyCode)
            .Build();
        
        // Assert
        bucketListItem.OriginalPrice.Should().Be(0.00m);
        bucketListItem.OriginalCurrencyCode.Should().Be(currencyCode);
    }
}