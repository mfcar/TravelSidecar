namespace Api.Enums;

public enum ActivityType
{
    // Transportation
    Flight = 1,
    Train = 2,
    Bus = 3,
    Car = 4,
    Ferry = 5,
    Cruise = 6,
    Transportation = 7, // Generic
    
    // Accommodation
    Hotel = 20,
    Hostel = 21,
    Vacation = 22, // Vacation rental (Airbnb, VRBO)
    Camping = 23,
    Lodging = 24, // Generic
    
    // Food & Drink
    Restaurant = 40,
    Cafe = 41,
    Bar = 42,
    
    // Activities & Entertainment
    Sightseeing = 60,
    Museum = 61,
    Tour = 62,
    Concert = 63,
    Theater = 64,
    Event = 65,
    Beach = 66,
    Park = 67,
    Entertainment = 68, // Generic
    Activity = 69, // Generic activity
    
    // Services
    Shopping = 80,
    Spa = 81,
    Fitness = 82,
    Medical = 83,
    
    // Other
    Meeting = 100,
    Custom = 101,
    Other = 102
}