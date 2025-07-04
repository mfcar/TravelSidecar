using Api.Data.Context;
using Api.Data.Entities;
using Api.DTOs.Activities;
using Api.Enums;
using Microsoft.EntityFrameworkCore;
using NodaTime;
using NodaTime.Text;
using System.Text.Json;

namespace Api.Services;

public class ActivityService : IActivityService
{
    private readonly ApplicationContext _context;
    private readonly ILogger<ActivityService> _logger;

    public ActivityService(ApplicationContext context, ILogger<ActivityService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<JourneyActivity>> GetActivitiesByJourneyIdAsync(Guid journeyId, string sortMode, CancellationToken ct)
    {
        var query = _context.Set<JourneyActivity>()
            .Where(a => a.JourneyId == journeyId && !a.IsDeleted)
            .Include(a => a.Attachments)
                .ThenInclude(att => att.FileMetadata)
            .Include(a => a.Currency)
            .AsQueryable();

        if (sortMode.ToLowerInvariant() == "time")
        {
            query = query.OrderBy(a => a.StartDateTime ?? new LocalDateTime(9999, 12, 31, 23, 59, 59))
                .ThenBy(a => a.ManualSortOrder);
        }
        else
        {
            query = query.OrderBy(a => a.ManualSortOrder);
        }

        return await query.ToListAsync(ct);
    }

    public async Task<List<JourneyActivity>> GetActivitiesByDayNumberAsync(Guid journeyId, int dayNumber, string sortMode, CancellationToken ct)
    {
        var query = _context.Set<JourneyActivity>()
            .Where(a => a.JourneyId == journeyId && a.DayNumber == dayNumber && !a.IsDeleted)
            .Include(a => a.Attachments)
                .ThenInclude(att => att.FileMetadata)
            .Include(a => a.Currency)
            .AsQueryable();

        if (sortMode.ToLowerInvariant() == "time")
        {
            query = query.OrderBy(a => a.StartDateTime ?? new LocalDateTime(9999, 12, 31, 23, 59, 59))
                .ThenBy(a => a.ManualSortOrder);
        }
        else
        {
            query = query.OrderBy(a => a.ManualSortOrder);
        }

        return await query.ToListAsync(ct);
    }

    public async Task<List<JourneyActivity>> GetActivitiesByDateAsync(Guid journeyId, LocalDate date, string sortMode, CancellationToken ct)
    {
        var journey = await _context.Set<Journey>()
            .FirstOrDefaultAsync(j => j.Id == journeyId && !j.IsDeleted, ct);

        if (journey == null || !journey.StartDate.HasValue)
        {
            return new List<JourneyActivity>();
        }

        var datePeriod = Period.Between(
            new LocalDate(journey.StartDate.Value.Year, journey.StartDate.Value.Month, journey.StartDate.Value.Day),
            date,
            PeriodUnits.Days);
        var dayNumber = datePeriod.Days + 1;
        return await GetActivitiesByDayNumberAsync(journeyId, dayNumber, sortMode, ct);
    }

    public async Task<JourneyActivity?> GetActivityByIdAsync(Guid journeyId, Guid activityId, CancellationToken ct)
    {
        return await _context.Set<JourneyActivity>()
            .Include(a => a.Attachments)
                .ThenInclude(att => att.FileMetadata)
            .Include(a => a.Currency)
            .FirstOrDefaultAsync(a => a.Id == activityId && a.JourneyId == journeyId && !a.IsDeleted, ct);
    }

    public async Task<JourneyActivity> CreateActivityAsync(Guid journeyId, CreateUpdateActivityRequest request, Guid userId, CancellationToken ct)
    {
        var activity = new JourneyActivity
        {
            Id = Guid.NewGuid(),
            JourneyId = journeyId,
            UserId = userId,
            Name = request.Name,
            Description = request.Description,
            ActivityType = request.ActivityType,
            StartDateTime = request.StartDateTime,
            StartTimezone = request.StartTimezone,
            EndDateTime = request.EndDateTime,
            EndTimezone = request.EndTimezone,
            DayNumber = request.DayNumber,
            StartLocation = request.StartLocation,
            EndLocation = request.EndLocation,
            Address = request.Address,
            PhoneNumber = request.PhoneNumber,
            Website = request.Website,
            Cost = request.Cost,
            CurrencyCode = request.CurrencyCode,
            Notes = request.Notes,
            CreatedByUserId = userId,
            CreatedAt = Instant.FromDateTimeUtc(DateTime.UtcNow),
            LastModifiedAt = Instant.FromDateTimeUtc(DateTime.UtcNow)
        };

        if (request.TypeSpecificData.HasValue)
        {
            activity.TypeSpecificData = request.TypeSpecificData.Value.GetRawText();
        }

        // Calculate DayNumber if StartDateTime is provided and journey has dates
        if (activity.StartDateTime.HasValue && !activity.DayNumber.HasValue)
        {
            var journey = await _context.Set<Journey>()
                .FirstOrDefaultAsync(j => j.Id == journeyId, ct);
            
            if (journey?.StartDate != null)
            {
                var activityDate = activity.StartDateTime.Value.Date;
                var journeyStartDate = new LocalDate(journey.StartDate.Value.Year, journey.StartDate.Value.Month, journey.StartDate.Value.Day);
                activity.DayNumber = (int)Period.Between(journeyStartDate, activityDate, PeriodUnits.Days).Days + 1;
            }
        }

        // Set manual sort order to be last
        var maxSortOrder = await _context.Set<JourneyActivity>()
            .Where(a => a.JourneyId == journeyId && a.DayNumber == activity.DayNumber && !a.IsDeleted)
            .MaxAsync(a => (int?)a.ManualSortOrder, ct) ?? -1;
        
        activity.ManualSortOrder = maxSortOrder + 1;

        _context.Set<JourneyActivity>().Add(activity);
        await _context.SaveChangesAsync(ct);

        return activity;
    }

    public async Task<JourneyActivity?> UpdateActivityAsync(Guid journeyId, Guid activityId, CreateUpdateActivityRequest request, Guid userId, CancellationToken ct)
    {
        var activity = await GetActivityByIdAsync(journeyId, activityId, ct);
        if (activity == null)
        {
            return null;
        }

        activity.Name = request.Name;
        activity.Description = request.Description;
        activity.ActivityType = request.ActivityType;
        activity.StartDateTime = request.StartDateTime;
        activity.StartTimezone = request.StartTimezone;
        activity.EndDateTime = request.EndDateTime;
        activity.EndTimezone = request.EndTimezone;
        activity.DayNumber = request.DayNumber;
        activity.StartLocation = request.StartLocation;
        activity.EndLocation = request.EndLocation;
        activity.Address = request.Address;
        activity.PhoneNumber = request.PhoneNumber;
        activity.Website = request.Website;
        activity.Cost = request.Cost;
        activity.CurrencyCode = request.CurrencyCode;
        activity.Notes = request.Notes;
        activity.LastModifiedAt = Instant.FromDateTimeUtc(DateTime.UtcNow);
        activity.LastModifiedByUserId = userId;

        if (request.TypeSpecificData.HasValue)
        {
            activity.TypeSpecificData = request.TypeSpecificData.Value.GetRawText();
        }
        else
        {
            activity.TypeSpecificData = null;
        }

        await _context.SaveChangesAsync(ct);
        return activity;
    }

    public async Task<bool> DeleteActivityAsync(Guid journeyId, Guid activityId, CancellationToken ct)
    {
        var activity = await GetActivityByIdAsync(journeyId, activityId, ct);
        if (activity == null)
        {
            return false;
        }

        activity.IsDeleted = true;
        activity.DeletedAt = Instant.FromDateTimeUtc(DateTime.UtcNow);
        activity.LastModifiedAt = Instant.FromDateTimeUtc(DateTime.UtcNow);

        await _context.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> ReorderActivitiesAsync(Guid journeyId, List<ActivityOrderItem> activities, CancellationToken ct)
    {
        var activityIds = activities.Select(a => a.ActivityId).ToList();
        var dbActivities = await _context.Set<JourneyActivity>()
            .Where(a => a.JourneyId == journeyId && activityIds.Contains(a.Id) && !a.IsDeleted)
            .ToListAsync(ct);

        if (dbActivities.Count != activities.Count)
        {
            return false;
        }

        foreach (var orderItem in activities)
        {
            var activity = dbActivities.FirstOrDefault(a => a.Id == orderItem.ActivityId);
            if (activity != null)
            {
                activity.ManualSortOrder = orderItem.ManualSortOrder;
                activity.LastModifiedAt = Instant.FromDateTimeUtc(DateTime.UtcNow);
            }
        }

        await _context.SaveChangesAsync(ct);
        return true;
    }

    public async Task<CalendarSummaryResponse> GetCalendarSummaryAsync(Guid journeyId, CancellationToken ct)
    {
        var journey = await _context.Set<Journey>()
            .FirstOrDefaultAsync(j => j.Id == journeyId && !j.IsDeleted, ct);

        if (journey == null)
        {
            return new CalendarSummaryResponse();
        }

        var activities = await _context.Set<JourneyActivity>()
            .Where(a => a.JourneyId == journeyId && !a.IsDeleted)
            .Select(a => new { a.StartDateTime, a.DayNumber })
            .ToListAsync(ct);

        var response = new CalendarSummaryResponse();

        if (journey.StartDate.HasValue)
        {
            // For dated journeys
            var activityCounts = activities
                .Where(a => a.StartDateTime.HasValue)
                .GroupBy(a => a.StartDateTime!.Value.Date)
                .Select(g => new DayActivityCount
                {
                    Date = g.Key,
                    ActivityCount = g.Count()
                })
                .OrderBy(d => d.Date)
                .ToList();

            response.DaysWithActivities = activityCounts;
        }
        else
        {
            // For undated journeys
            var indexedCounts = activities
                .Where(a => a.DayNumber.HasValue)
                .GroupBy(a => a.DayNumber!.Value)
                .Select(g => new DayActivityCountIndexed
                {
                    DayNumber = g.Key,
                    ActivityCount = g.Count()
                })
                .OrderBy(d => d.DayNumber)
                .ToList();

            response.DaysWithActivitiesIndexed = indexedCounts;
        }

        return response;
    }

    public ActivityBaseDto MapToDto(JourneyActivity activity)
    {
        ActivityBaseDto dto = activity.ActivityType switch
        {
            ActivityType.Flight => new FlightActivityDto(),
            ActivityType.Hotel or ActivityType.Hostel or ActivityType.Vacation or ActivityType.Camping or ActivityType.Lodging => new LodgingActivityDto(),
            ActivityType.Train or ActivityType.Bus or ActivityType.Ferry or ActivityType.Cruise => new TransportActivityDto(),
            ActivityType.Car => new CarRentalActivityDto(),
            _ => new ActivityBaseDto()
        };

        // Map base properties
        dto.Id = activity.Id;
        dto.Name = activity.Name;
        dto.Description = activity.Description;
        dto.ActivityType = activity.ActivityType;
        dto.StartDateTime = activity.StartDateTime;
        dto.StartTimezone = activity.StartTimezone;
        dto.EndDateTime = activity.EndDateTime;
        dto.EndTimezone = activity.EndTimezone;
        dto.DayNumber = activity.DayNumber;
        dto.StartLocation = activity.StartLocation;
        dto.EndLocation = activity.EndLocation;
        dto.Address = activity.Address;
        dto.PhoneNumber = activity.PhoneNumber;
        dto.Website = activity.Website;
        dto.Cost = activity.Cost;
        dto.CurrencyCode = activity.CurrencyCode;
        dto.Notes = activity.Notes;
        dto.ManualSortOrder = activity.ManualSortOrder;
        dto.CreatedAt = activity.CreatedAt;
        dto.LastModifiedAt = activity.LastModifiedAt;
        dto.CreatedByUserId = activity.CreatedByUserId;
        dto.LastModifiedByUserId = activity.LastModifiedByUserId;

        // Map attachments
        dto.Attachments = activity.Attachments.Select(a => new ActivityAttachmentDto
        {
            Id = a.Id,
            FileMetadataId = a.FileMetadataId,
            Description = a.Description,
            SortOrder = a.SortOrder,
            FileName = a.FileMetadata?.FileName,
            FileType = a.FileMetadata?.ContentType,
            FileSize = a.FileMetadata?.FileSize,
            ThumbnailUrl = a.FileMetadata?.ContentType?.StartsWith("image/") == true 
                ? $"/api/files/images/{a.FileMetadataId}?size=thumbnail" 
                : null,
            FileUrl = $"/api/files/{a.FileMetadataId}"
        }).ToList();

        // Map type-specific data if available
        if (!string.IsNullOrEmpty(activity.TypeSpecificData))
        {
            try
            {
                var typeData = JsonSerializer.Deserialize<JsonElement>(activity.TypeSpecificData);
                
                switch (dto)
                {
                    case FlightActivityDto flight:
                        flight.FlightNumber = GetStringValue(typeData, "flightNumber");
                        flight.Airline = GetStringValue(typeData, "airline");
                        flight.SeatNumber = GetStringValue(typeData, "seatNumber");
                        flight.SeatClass = GetStringValue(typeData, "seatClass");
                        flight.ReservationCode = GetStringValue(typeData, "reservationCode");
                        flight.DepartureGate = GetStringValue(typeData, "departureGate");
                        flight.ArrivalGate = GetStringValue(typeData, "arrivalGate");
                        flight.DepartureTerminal = GetStringValue(typeData, "departureTerminal");
                        flight.ArrivalTerminal = GetStringValue(typeData, "arrivalTerminal");
                        break;
                        
                    case LodgingActivityDto lodging:
                        lodging.ReservationCode = GetStringValue(typeData, "reservationCode");
                        lodging.RoomNumber = GetStringValue(typeData, "roomNumber");
                        lodging.RoomType = GetStringValue(typeData, "roomType");
                        var checkInTimeStr = GetStringValue(typeData, "checkInTime");
                        if (!string.IsNullOrEmpty(checkInTimeStr))
                        {
                            try
                            {
                                lodging.CheckInTime = LocalTimePattern.Create("HH:mm", System.Globalization.CultureInfo.InvariantCulture).Parse(checkInTimeStr).Value;
                            }
                            catch { }
                        }
                        var checkOutTimeStr = GetStringValue(typeData, "checkOutTime");
                        if (!string.IsNullOrEmpty(checkOutTimeStr))
                        {
                            try
                            {
                                lodging.CheckOutTime = LocalTimePattern.Create("HH:mm", System.Globalization.CultureInfo.InvariantCulture).Parse(checkOutTimeStr).Value;
                            }
                            catch { }
                        }
                        lodging.NumberOfGuests = GetIntValue(typeData, "numberOfGuests");
                        break;
                        
                    case TransportActivityDto transport:
                        transport.RouteName = GetStringValue(typeData, "routeName");
                        transport.TransportNumber = GetStringValue(typeData, "transportNumber");
                        transport.Company = GetStringValue(typeData, "company");
                        transport.DepartureStation = GetStringValue(typeData, "departureStation") ?? GetStringValue(typeData, "departureLocation");
                        transport.ArrivalStation = GetStringValue(typeData, "arrivalStation") ?? GetStringValue(typeData, "arrivalLocation");
                        transport.ReservationCode = GetStringValue(typeData, "reservationCode");
                        transport.SeatNumber = GetStringValue(typeData, "seatNumber");
                        transport.SeatClass = GetStringValue(typeData, "seatClass");
                        transport.CoachNumber = GetStringValue(typeData, "coachNumber");
                        transport.TrainType = GetStringValue(typeData, "trainType");
                        transport.CabinNumber = GetStringValue(typeData, "cabinNumber");
                        transport.CabinType = GetStringValue(typeData, "cabinType");
                        transport.Deck = GetStringValue(typeData, "deck");
                        transport.DeparturePort = GetStringValue(typeData, "departurePort");
                        transport.ArrivalPort = GetStringValue(typeData, "arrivalPort");
                        transport.VehicleIncluded = GetBoolValue(typeData, "vehicleIncluded");
                        break;
                        
                    case CarRentalActivityDto car:
                        car.Company = GetStringValue(typeData, "company");
                        car.PickupLocation = GetStringValue(typeData, "pickupLocation");
                        car.DropoffLocation = GetStringValue(typeData, "dropoffLocation");
                        car.ReservationCode = GetStringValue(typeData, "reservationCode");
                        car.Vehicle = GetStringValue(typeData, "vehicle");
                        car.VehicleClass = GetStringValue(typeData, "vehicleClass");
                        break;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to parse type-specific data for activity {ActivityId}", activity.Id);
            }
        }

        return dto;
    }

    public async Task<bool> ValidateJourneyAccessAsync(Guid journeyId, Guid userId, CancellationToken ct)
    {
        var journey = await _context.Set<Journey>()
            .AnyAsync(j => j.Id == journeyId && j.UserId == userId && !j.IsDeleted, ct);
        
        return journey;
    }

    private static string? GetStringValue(JsonElement element, string propertyName)
    {
        return element.TryGetProperty(propertyName, out var value) && value.ValueKind == JsonValueKind.String
            ? value.GetString()
            : null;
    }

    private static int? GetIntValue(JsonElement element, string propertyName)
    {
        return element.TryGetProperty(propertyName, out var value) && value.ValueKind == JsonValueKind.Number
            ? value.GetInt32()
            : null;
    }

    private static bool? GetBoolValue(JsonElement element, string propertyName)
    {
        return element.TryGetProperty(propertyName, out var value) && 
               (value.ValueKind == JsonValueKind.True || value.ValueKind == JsonValueKind.False)
            ? value.GetBoolean()
            : null;
    }
}