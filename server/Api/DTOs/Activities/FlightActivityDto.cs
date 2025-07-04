namespace Api.DTOs.Activities;

public class FlightActivityDto : ActivityBaseDto
{
    public string? FlightNumber { get; set; }
    public string? Airline { get; set; }
    public string? SeatNumber { get; set; }
    public string? SeatClass { get; set; }
    public string? ReservationCode { get; set; }
    public string? DepartureGate { get; set; }
    public string? ArrivalGate { get; set; }
    public string? DepartureTerminal { get; set; }
    public string? ArrivalTerminal { get; set; }
}