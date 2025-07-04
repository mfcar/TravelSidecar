using NodaTime;

namespace Api.DTOs.Activities;

public class LodgingActivityDto : ActivityBaseDto
{
    public string? ReservationCode { get; set; }
    public string? RoomNumber { get; set; }
    public string? RoomType { get; set; }
    public LocalTime? CheckInTime { get; set; }
    public LocalTime? CheckOutTime { get; set; }
    public int? NumberOfGuests { get; set; }
}