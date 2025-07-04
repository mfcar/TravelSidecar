namespace Api.DTOs.Activities;

public class CarRentalActivityDto : ActivityBaseDto
{
    public string? Company { get; set; }
    public string? PickupLocation { get; set; }
    public string? DropoffLocation { get; set; }
    public string? ReservationCode { get; set; }
    public string? Vehicle { get; set; }
    public string? VehicleClass { get; set; }
}