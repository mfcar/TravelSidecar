using Api.Enums;
using Api.Services;
using FluentAssertions;
using NodaTime;
using NodaTime.Testing;
using Xunit;

namespace Api.Tests.Unit.Services;

public class JourneyServiceTests
{
    private readonly FakeClock _fakeClock;
    private readonly JourneyService _journeyService;

    public JourneyServiceTests()
    {
        // Set up a fake clock for consistent testing
        var fixedInstant = Instant.FromUtc(2024, 7, 15, 10, 0); // July 15, 2024
        _fakeClock = new FakeClock(fixedInstant);
        _journeyService = new JourneyService(_fakeClock);
    }

    #region CalculateDaysUntilStartJourney Tests

    [Fact]
    public void CalculateDaysUntilStartJourney_ShouldReturnNull_WhenStartDateIsNull()
    {
        // Arrange
        LocalDate? startDate = null;
        
        // Act
        var result = _journeyService.CalculateDaysUntilStartJourney(startDate);
        
        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public void CalculateDaysUntilStartJourney_ShouldReturnPositiveDays_WhenStartDateIsInFuture()
    {
        // Arrange
        var startDate = new LocalDate(2024, 7, 20); // 5 days from fake clock date
        
        // Act
        var result = _journeyService.CalculateDaysUntilStartJourney(startDate);
        
        // Assert
        result.Should().Be(5);
    }

    [Fact]
    public void CalculateDaysUntilStartJourney_ShouldReturnZero_WhenStartDateIsToday()
    {
        // Arrange
        var startDate = new LocalDate(2024, 7, 15); // Same as fake clock date
        
        // Act
        var result = _journeyService.CalculateDaysUntilStartJourney(startDate);
        
        // Assert
        result.Should().Be(0);
    }

    [Fact]
    public void CalculateDaysUntilStartJourney_ShouldReturnNegativeDays_WhenStartDateIsInPast()
    {
        // Arrange
        var startDate = new LocalDate(2024, 7, 10); // 5 days before fake clock date
        
        // Act
        var result = _journeyService.CalculateDaysUntilStartJourney(startDate);
        
        // Assert
        result.Should().Be(-5);
    }

    #endregion

    #region CalculateJourneyDurationInDays Tests

    [Fact]
    public void CalculateJourneyDurationInDays_ShouldReturnNull_WhenBothDatesAreNull()
    {
        // Arrange
        LocalDate? startDate = null;
        LocalDate? endDate = null;
        
        // Act
        var result = _journeyService.CalculateJourneyDurationInDays(startDate, endDate);
        
        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public void CalculateJourneyDurationInDays_ShouldReturnNull_WhenStartDateIsNull()
    {
        // Arrange
        LocalDate? startDate = null;
        var endDate = new LocalDate(2024, 7, 20);
        
        // Act
        var result = _journeyService.CalculateJourneyDurationInDays(startDate, endDate);
        
        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public void CalculateJourneyDurationInDays_ShouldReturnNull_WhenEndDateIsNull()
    {
        // Arrange
        var startDate = new LocalDate(2024, 7, 15);
        LocalDate? endDate = null;
        
        // Act
        var result = _journeyService.CalculateJourneyDurationInDays(startDate, endDate);
        
        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public void CalculateJourneyDurationInDays_ShouldReturnDuration_WhenBothDatesProvided()
    {
        // Arrange
        var startDate = new LocalDate(2024, 7, 15);
        var endDate = new LocalDate(2024, 7, 20);
        
        // Act
        var result = _journeyService.CalculateJourneyDurationInDays(startDate, endDate);
        
        // Assert
        result.Should().Be(5);
    }

    [Fact]
    public void CalculateJourneyDurationInDays_ShouldReturnZero_WhenStartAndEndDateAreSame()
    {
        // Arrange
        var startDate = new LocalDate(2024, 7, 15);
        var endDate = new LocalDate(2024, 7, 15);
        
        // Act
        var result = _journeyService.CalculateJourneyDurationInDays(startDate, endDate);
        
        // Assert
        result.Should().Be(0);
    }

    [Fact]
    public void CalculateJourneyDurationInDays_ShouldHandleLongDuration()
    {
        // Arrange
        var startDate = new LocalDate(2024, 1, 1);
        var endDate = new LocalDate(2024, 12, 31);
        
        // Act
        var result = _journeyService.CalculateJourneyDurationInDays(startDate, endDate);
        
        // Assert
        result.Should().Be(365); // 2024 is a leap year
    }

    #endregion

    #region CalculateStatus Tests - No Dates Scenario

    [Fact]
    public void CalculateStatus_ShouldReturnUnknown_WhenBothDatesAreNull()
    {
        // Arrange
        LocalDate? startDate = null;
        LocalDate? endDate = null;
        
        // Act
        var result = _journeyService.CalculateStatus(startDate, endDate);
        
        // Assert
        result.Should().Be(JourneyStatus.Unknown);
    }

    #endregion

    #region CalculateStatus Tests - Only Start Date Scenario

    [Fact]
    public void CalculateStatus_ShouldReturnUpcoming_WhenOnlyStartDateProvidedAndInFuture()
    {
        // Arrange
        var startDate = new LocalDate(2024, 7, 20); // Future date
        LocalDate? endDate = null;
        
        // Act
        var result = _journeyService.CalculateStatus(startDate, endDate);
        
        // Assert
        result.Should().Be(JourneyStatus.Upcoming);
    }

    [Fact]
    public void CalculateStatus_ShouldReturnInProgress_WhenOnlyStartDateProvidedAndIsToday()
    {
        // Arrange
        var startDate = new LocalDate(2024, 7, 15); // Today
        LocalDate? endDate = null;
        
        // Act
        var result = _journeyService.CalculateStatus(startDate, endDate);
        
        // Assert
        result.Should().Be(JourneyStatus.InProgress);
    }

    [Fact]
    public void CalculateStatus_ShouldReturnInProgress_WhenOnlyStartDateProvidedAndInPast()
    {
        // Arrange
        var startDate = new LocalDate(2024, 7, 10); // Past date
        LocalDate? endDate = null;
        
        // Act
        var result = _journeyService.CalculateStatus(startDate, endDate);
        
        // Assert
        result.Should().Be(JourneyStatus.InProgress);
    }

    #endregion

    #region CalculateStatus Tests - Both Dates Scenario

    [Fact]
    public void CalculateStatus_ShouldReturnUpcoming_WhenBothDatesInFuture()
    {
        // Arrange
        var startDate = new LocalDate(2024, 7, 20);
        var endDate = new LocalDate(2024, 7, 25);
        
        // Act
        var result = _journeyService.CalculateStatus(startDate, endDate);
        
        // Assert
        result.Should().Be(JourneyStatus.Upcoming);
    }

    [Fact]
    public void CalculateStatus_ShouldReturnInProgress_WhenTodayIsStartDate()
    {
        // Arrange
        var startDate = new LocalDate(2024, 7, 15); // Today
        var endDate = new LocalDate(2024, 7, 20);
        
        // Act
        var result = _journeyService.CalculateStatus(startDate, endDate);
        
        // Assert
        result.Should().Be(JourneyStatus.InProgress);
    }

    [Fact]
    public void CalculateStatus_ShouldReturnInProgress_WhenTodayIsBetweenStartAndEndDate()
    {
        // Arrange
        var startDate = new LocalDate(2024, 7, 10);
        var endDate = new LocalDate(2024, 7, 20);
        
        // Act
        var result = _journeyService.CalculateStatus(startDate, endDate);
        
        // Assert
        result.Should().Be(JourneyStatus.InProgress);
    }

    [Fact]
    public void CalculateStatus_ShouldReturnInProgress_WhenTodayIsEndDate()
    {
        // Arrange
        var startDate = new LocalDate(2024, 7, 10);
        var endDate = new LocalDate(2024, 7, 15); // Today
        
        // Act
        var result = _journeyService.CalculateStatus(startDate, endDate);
        
        // Assert
        result.Should().Be(JourneyStatus.InProgress);
    }

    [Fact]
    public void CalculateStatus_ShouldReturnCompleted_WhenBothDatesInPast()
    {
        // Arrange
        var startDate = new LocalDate(2024, 7, 5);
        var endDate = new LocalDate(2024, 7, 10);
        
        // Act
        var result = _journeyService.CalculateStatus(startDate, endDate);
        
        // Assert
        result.Should().Be(JourneyStatus.Completed);
    }

    [Fact]
    public void CalculateStatus_ShouldReturnInProgress_WhenStartAndEndDateAreSameAsToday()
    {
        // Arrange
        var startDate = new LocalDate(2024, 7, 15); // Today
        var endDate = new LocalDate(2024, 7, 15); // Today
        
        // Act
        var result = _journeyService.CalculateStatus(startDate, endDate);
        
        // Assert
        result.Should().Be(JourneyStatus.InProgress);
    }

    #endregion

    #region ValidateAndParseDates Tests

    [Fact]
    public void ValidateAndParseDates_ShouldReturnNullDates_WhenBothDatesAreNull()
    {
        // Arrange
        DateOnly? startDate = null;
        DateOnly? endDate = null;
        
        // Act
        var result = _journeyService.ValidateAndParseDates(startDate, endDate);
        
        // Assert
        result.StartDate.Should().BeNull();
        result.EndDate.Should().BeNull();
        result.Error.Should().BeNull();
    }

    [Fact]
    public void ValidateAndParseDates_ShouldConvertStartDateOnly()
    {
        // Arrange
        var startDate = new DateOnly(2024, 7, 15);
        DateOnly? endDate = null;
        
        // Act
        var result = _journeyService.ValidateAndParseDates(startDate, endDate);
        
        // Assert
        result.StartDate.Should().Be(new LocalDate(2024, 7, 15));
        result.EndDate.Should().BeNull();
        result.Error.Should().BeNull();
    }

    [Fact]
    public void ValidateAndParseDates_ShouldConvertEndDateOnly()
    {
        // Arrange
        DateOnly? startDate = null;
        var endDate = new DateOnly(2024, 7, 20);
        
        // Act
        var result = _journeyService.ValidateAndParseDates(startDate, endDate);
        
        // Assert
        result.StartDate.Should().BeNull();
        result.EndDate.Should().Be(new LocalDate(2024, 7, 20));
        result.Error.Should().BeNull();
    }

    [Fact]
    public void ValidateAndParseDates_ShouldConvertBothDates_WhenValidOrder()
    {
        // Arrange
        var startDate = new DateOnly(2024, 7, 15);
        var endDate = new DateOnly(2024, 7, 20);
        
        // Act
        var result = _journeyService.ValidateAndParseDates(startDate, endDate);
        
        // Assert
        result.StartDate.Should().Be(new LocalDate(2024, 7, 15));
        result.EndDate.Should().Be(new LocalDate(2024, 7, 20));
        result.Error.Should().BeNull();
    }

    [Fact]
    public void ValidateAndParseDates_ShouldAllowSameStartAndEndDate()
    {
        // Arrange
        var startDate = new DateOnly(2024, 7, 15);
        var endDate = new DateOnly(2024, 7, 15);
        
        // Act
        var result = _journeyService.ValidateAndParseDates(startDate, endDate);
        
        // Assert
        result.StartDate.Should().Be(new LocalDate(2024, 7, 15));
        result.EndDate.Should().Be(new LocalDate(2024, 7, 15));
        result.Error.Should().BeNull();
    }

    [Fact]
    public void ValidateAndParseDates_ShouldReturnError_WhenEndDateBeforeStartDate()
    {
        // Arrange
        var startDate = new DateOnly(2024, 7, 20);
        var endDate = new DateOnly(2024, 7, 15);
        
        // Act
        var result = _journeyService.ValidateAndParseDates(startDate, endDate);
        
        // Assert
        result.StartDate.Should().BeNull();
        result.EndDate.Should().BeNull();
        result.Error.Should().Be("End date cannot be before the Start date.");
    }

    #endregion

    #region Edge Cases and Integration Tests

    [Fact]
    public void JourneyService_ShouldHandleLeapYearCalculations()
    {
        // Arrange
        var startDate = new LocalDate(2024, 2, 28); // Leap year
        var endDate = new LocalDate(2024, 3, 1);
        
        // Act
        var duration = _journeyService.CalculateJourneyDurationInDays(startDate, endDate);
        
        // Assert
        duration.Should().Be(2); // Feb 28 -> Feb 29 -> Mar 1
    }

    [Fact]
    public void JourneyService_ShouldHandleYearBoundaryCalculations()
    {
        // Arrange
        var startDate = new LocalDate(2023, 12, 31);
        var endDate = new LocalDate(2024, 1, 1);
        
        // Act
        var duration = _journeyService.CalculateJourneyDurationInDays(startDate, endDate);
        
        // Assert
        duration.Should().Be(1);
    }

    [Fact]
    public void JourneyService_ShouldBeConsistentBetweenCalculations()
    {
        // Arrange
        var startDate = new LocalDate(2024, 7, 10);
        var endDate = new LocalDate(2024, 7, 20);
        
        // Act
        var duration = _journeyService.CalculateJourneyDurationInDays(startDate, endDate);
        var daysUntilStart = _journeyService.CalculateDaysUntilStartJourney(startDate);
        var status = _journeyService.CalculateStatus(startDate, endDate);
        
        // Assert
        duration.Should().Be(10);
        daysUntilStart.Should().Be(-5); // 5 days in the past
        status.Should().Be(JourneyStatus.InProgress);
    }

    [Fact]
    public void JourneyService_ShouldHandleExtremeDates()
    {
        // Arrange
        var startDate = new LocalDate(2000, 1, 1);
        var endDate = new LocalDate(2030, 12, 31);
        
        // Act
        var duration = _journeyService.CalculateJourneyDurationInDays(startDate, endDate);
        var status = _journeyService.CalculateStatus(startDate, endDate);
        
        // Assert
        duration.Should().BePositive();
        status.Should().Be(JourneyStatus.InProgress); // Current fake date is between these dates
    }

    #endregion
}