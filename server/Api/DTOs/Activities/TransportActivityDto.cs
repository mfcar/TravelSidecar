namespace Api.DTOs.Activities;

public class TransportActivityDto : ActivityBaseDto
{
    public string? RouteName { get; set; }
    public string? TransportNumber { get; set; }
    public string? Company { get; set; }
    public string? DepartureStation { get; set; }
    public string? ArrivalStation { get; set; }
    public string? ReservationCode { get; set; }
    public string? SeatNumber { get; set; }
    public string? SeatClass { get; set; }
    
    // Train specific
    public string? CoachNumber { get; set; }
    public string? TrainType { get; set; }
    
    // Cruise/Ferry specific
    public string? CabinNumber { get; set; }
    public string? CabinType { get; set; }
    public string? Deck { get; set; }
    public string? DeparturePort { get; set; }
    public string? ArrivalPort { get; set; }
    
    // Ferry specific
    public bool? VehicleIncluded { get; set; }
}