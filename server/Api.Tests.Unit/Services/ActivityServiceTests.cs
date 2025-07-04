using Api.Data.Context;
using Api.Data.Entities;
using Api.DTOs.Activities;
using Api.Enums;
using Api.Services;
using Api.Tests.Unit.Helpers;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NodaTime;
using NSubstitute;
using System.Text.Json;
using Xunit;

namespace Api.Tests.Unit.Services;

public class ActivityServiceTests : IDisposable
{
    private readonly ApplicationContext _context;
    private readonly ActivityService _activityService;
    private readonly ILogger<ActivityService> _logger;

    public ActivityServiceTests()
    {
        _context = TestDbContextFactory.Create();
        _logger = Substitute.For<ILogger<ActivityService>>();
        _activityService = new ActivityService(_context, _logger);
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    [Fact]
    public async Task GetActivitiesByJourneyIdAsync_ShouldReturnActivities_WhenActivitiesExist()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var journey = TestDataBuilder.CreateJourney(userId, "Test Journey");
        _context.Set<Journey>().Add(journey);

        var activity1 = CreateTestActivity(journey.Id, userId, "Activity 1", 0);
        var activity2 = CreateTestActivity(journey.Id, userId, "Activity 2", 1);
        _context.Set<JourneyActivity>().AddRange(activity1, activity2);
        await _context.SaveChangesAsync();

        // Act
        var result = await _activityService.GetActivitiesByJourneyIdAsync(journey.Id, "manual", CancellationToken.None);

        // Assert
        result.Should().HaveCount(2);
        result[0].Name.Should().Be("Activity 1");
        result[1].Name.Should().Be("Activity 2");
    }

    [Fact]
    public async Task GetActivitiesByJourneyIdAsync_ShouldOrderByTime_WhenSortModeIsTime()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var journey = TestDataBuilder.CreateJourney(userId, "Test Journey");
        _context.Set<Journey>().Add(journey);

        var activity1 = CreateTestActivity(journey.Id, userId, "Activity 1", 0);
        activity1.StartDateTime = new LocalDateTime(2024, 7, 15, 14, 0);
        
        var activity2 = CreateTestActivity(journey.Id, userId, "Activity 2", 1);
        activity2.StartDateTime = new LocalDateTime(2024, 7, 15, 10, 0);
        
        _context.Set<JourneyActivity>().AddRange(activity1, activity2);
        await _context.SaveChangesAsync();

        // Act
        var result = await _activityService.GetActivitiesByJourneyIdAsync(journey.Id, "time", CancellationToken.None);

        // Assert
        result.Should().HaveCount(2);
        result[0].Name.Should().Be("Activity 2"); // Earlier time
        result[1].Name.Should().Be("Activity 1"); // Later time
    }

    [Fact]
    public async Task GetActivitiesByJourneyIdAsync_ShouldExcludeDeletedActivities()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var journey = TestDataBuilder.CreateJourney(userId, "Test Journey");
        _context.Set<Journey>().Add(journey);

        var activity1 = CreateTestActivity(journey.Id, userId, "Activity 1", 0);
        var activity2 = CreateTestActivity(journey.Id, userId, "Activity 2", 1);
        activity2.IsDeleted = true;
        activity2.DeletedAt = Instant.FromDateTimeUtc(DateTime.UtcNow);
        
        _context.Set<JourneyActivity>().AddRange(activity1, activity2);
        await _context.SaveChangesAsync();

        // Act
        var result = await _activityService.GetActivitiesByJourneyIdAsync(journey.Id, "manual", CancellationToken.None);

        // Assert
        result.Should().HaveCount(1);
        result[0].Name.Should().Be("Activity 1");
    }

    [Fact]
    public async Task GetActivitiesByDayNumberAsync_ShouldReturnActivitiesForSpecificDay()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var journey = TestDataBuilder.CreateJourney(userId, "Test Journey");
        _context.Set<Journey>().Add(journey);

        var activity1 = CreateTestActivity(journey.Id, userId, "Day 1 Activity", 0);
        activity1.DayNumber = 1;
        
        var activity2 = CreateTestActivity(journey.Id, userId, "Day 2 Activity", 1);
        activity2.DayNumber = 2;
        
        _context.Set<JourneyActivity>().AddRange(activity1, activity2);
        await _context.SaveChangesAsync();

        // Act
        var result = await _activityService.GetActivitiesByDayNumberAsync(journey.Id, 1, "manual", CancellationToken.None);

        // Assert
        result.Should().HaveCount(1);
        result[0].Name.Should().Be("Day 1 Activity");
    }

    [Fact]
    public async Task GetActivityByIdAsync_ShouldReturnActivity_WhenActivityExists()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var journey = TestDataBuilder.CreateJourney(userId, "Test Journey");
        _context.Set<Journey>().Add(journey);

        var activity = CreateTestActivity(journey.Id, userId, "Test Activity", 0);
        _context.Set<JourneyActivity>().Add(activity);
        await _context.SaveChangesAsync();

        // Act
        var result = await _activityService.GetActivityByIdAsync(journey.Id, activity.Id, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Name.Should().Be("Test Activity");
    }

    [Fact]
    public async Task GetActivityByIdAsync_ShouldReturnNull_WhenActivityDoesNotExist()
    {
        // Arrange
        var journeyId = Guid.NewGuid();
        var activityId = Guid.NewGuid();

        // Act
        var result = await _activityService.GetActivityByIdAsync(journeyId, activityId, CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task CreateActivityAsync_ShouldCreateActivity_WithValidData()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var journey = TestDataBuilder.CreateJourney(userId, "Test Journey");
        _context.Set<Journey>().Add(journey);
        await _context.SaveChangesAsync();

        var request = new CreateUpdateActivityRequest
        {
            Name = "New Activity",
            Description = "Test Description",
            ActivityType = ActivityType.Flight,
            StartDateTime = new LocalDateTime(2024, 7, 15, 10, 0),
            StartTimezone = "America/New_York",
            EndDateTime = new LocalDateTime(2024, 7, 15, 14, 0),
            EndTimezone = "Europe/London",
            StartLocation = "New York",
            EndLocation = "London"
        };

        // Act
        var result = await _activityService.CreateActivityAsync(journey.Id, request, userId, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("New Activity");
        result.ActivityType.Should().Be(ActivityType.Flight);
        result.StartTimezone.Should().Be("America/New_York");
        result.EndTimezone.Should().Be("Europe/London");

        var savedActivity = await _context.Set<JourneyActivity>()
            .FirstOrDefaultAsync(a => a.Id == result.Id);
        savedActivity.Should().NotBeNull();
    }

    [Fact]
    public async Task CreateActivityAsync_ShouldCalculateDayNumber_WhenJourneyHasStartDate()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var journey = TestDataBuilder.CreateJourney(userId, "Test Journey", 
            startDate: new LocalDate(2024, 7, 10));
        _context.Set<Journey>().Add(journey);
        await _context.SaveChangesAsync();

        var request = new CreateUpdateActivityRequest
        {
            Name = "Day 6 Activity",
            ActivityType = ActivityType.Sightseeing,
            StartDateTime = new LocalDateTime(2024, 7, 15, 10, 0),
            StartTimezone = "America/New_York"
        };

        // Act
        var result = await _activityService.CreateActivityAsync(journey.Id, request, userId, CancellationToken.None);

        // Assert
        result.DayNumber.Should().Be(6); // July 15 is day 6 of journey starting July 10
    }

    [Fact]
    public async Task UpdateActivityAsync_ShouldUpdateActivity_WhenActivityExists()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var journey = TestDataBuilder.CreateJourney(userId, "Test Journey");
        _context.Set<Journey>().Add(journey);

        var activity = CreateTestActivity(journey.Id, userId, "Original Name", 0);
        _context.Set<JourneyActivity>().Add(activity);
        await _context.SaveChangesAsync();

        var request = new CreateUpdateActivityRequest
        {
            Name = "Updated Name",
            Description = "Updated Description",
            ActivityType = ActivityType.Restaurant,
            Cost = 50.00m,
            CurrencyCode = "USD"
        };

        // Act
        var result = await _activityService.UpdateActivityAsync(journey.Id, activity.Id, request, userId, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Name.Should().Be("Updated Name");
        result.Description.Should().Be("Updated Description");
        result.ActivityType.Should().Be(ActivityType.Restaurant);
        result.Cost.Should().Be(50.00m);
        result.LastModifiedByUserId.Should().Be(userId);
    }

    [Fact]
    public async Task DeleteActivityAsync_ShouldSoftDeleteActivity_WhenActivityExists()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var journey = TestDataBuilder.CreateJourney(userId, "Test Journey");
        _context.Set<Journey>().Add(journey);

        var activity = CreateTestActivity(journey.Id, userId, "To Delete", 0);
        _context.Set<JourneyActivity>().Add(activity);
        await _context.SaveChangesAsync();

        // Act
        var result = await _activityService.DeleteActivityAsync(journey.Id, activity.Id, CancellationToken.None);

        // Assert
        result.Should().BeTrue();
        
        var deletedActivity = await _context.Set<JourneyActivity>()
            .FirstOrDefaultAsync(a => a.Id == activity.Id);
        deletedActivity!.IsDeleted.Should().BeTrue();
        deletedActivity.DeletedAt.Should().NotBeNull();
    }

    [Fact]
    public async Task ReorderActivitiesAsync_ShouldUpdateSortOrder()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var journey = TestDataBuilder.CreateJourney(userId, "Test Journey");
        _context.Set<Journey>().Add(journey);

        var activity1 = CreateTestActivity(journey.Id, userId, "Activity 1", 0);
        var activity2 = CreateTestActivity(journey.Id, userId, "Activity 2", 1);
        _context.Set<JourneyActivity>().AddRange(activity1, activity2);
        await _context.SaveChangesAsync();

        var reorderRequest = new List<ActivityOrderItem>
        {
            new() { ActivityId = activity2.Id, ManualSortOrder = 0 },
            new() { ActivityId = activity1.Id, ManualSortOrder = 1 }
        };

        // Act
        var result = await _activityService.ReorderActivitiesAsync(journey.Id, reorderRequest, CancellationToken.None);

        // Assert
        result.Should().BeTrue();

        var reorderedActivity1 = await _context.Set<JourneyActivity>().FindAsync(activity1.Id);
        var reorderedActivity2 = await _context.Set<JourneyActivity>().FindAsync(activity2.Id);
        
        reorderedActivity1!.ManualSortOrder.Should().Be(1);
        reorderedActivity2!.ManualSortOrder.Should().Be(0);
    }

    [Fact]
    public void MapToDto_ShouldMapFlightSpecificData()
    {
        // Arrange
        var activity = new JourneyActivity
        {
            Id = Guid.NewGuid(),
            JourneyId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Name = "Flight to London",
            ActivityType = ActivityType.Flight,
            TypeSpecificData = JsonSerializer.Serialize(new
            {
                flightNumber = "AA123",
                airline = "American Airlines",
                seatNumber = "12A",
                departureGate = "B15"
            }),
            CreatedByUserId = Guid.NewGuid(),
            Attachments = new List<ActivityAttachment>()
        };

        // Act
        var dto = _activityService.MapToDto(activity);

        // Assert
        dto.Should().BeOfType<FlightActivityDto>();
        var flightDto = (FlightActivityDto)dto;
        flightDto.FlightNumber.Should().Be("AA123");
        flightDto.Airline.Should().Be("American Airlines");
        flightDto.SeatNumber.Should().Be("12A");
        flightDto.DepartureGate.Should().Be("B15");
    }

    [Fact]
    public async Task ValidateJourneyAccessAsync_ShouldReturnTrue_WhenUserOwnsJourney()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var journey = TestDataBuilder.CreateJourney(userId, "Test Journey");
        _context.Set<Journey>().Add(journey);
        await _context.SaveChangesAsync();

        // Act
        var result = await _activityService.ValidateJourneyAccessAsync(journey.Id, userId, CancellationToken.None);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task ValidateJourneyAccessAsync_ShouldReturnFalse_WhenUserDoesNotOwnJourney()
    {
        // Arrange
        var ownerId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();
        var journey = TestDataBuilder.CreateJourney(ownerId, "Test Journey");
        _context.Set<Journey>().Add(journey);
        await _context.SaveChangesAsync();

        // Act
        var result = await _activityService.ValidateJourneyAccessAsync(journey.Id, otherUserId, CancellationToken.None);

        // Assert
        result.Should().BeFalse();
    }

    private static JourneyActivity CreateTestActivity(Guid journeyId, Guid userId, string name, int sortOrder)
    {
        return new JourneyActivity
        {
            Id = Guid.NewGuid(),
            JourneyId = journeyId,
            UserId = userId,
            Name = name,
            ActivityType = ActivityType.Other,
            ManualSortOrder = sortOrder,
            CreatedByUserId = userId,
            CreatedAt = Instant.FromDateTimeUtc(DateTime.UtcNow),
            LastModifiedAt = Instant.FromDateTimeUtc(DateTime.UtcNow),
            Attachments = new List<ActivityAttachment>()
        };
    }
}