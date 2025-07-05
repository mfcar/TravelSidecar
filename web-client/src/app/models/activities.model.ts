export enum ActivityType {
  // Transportation
  Flight = 1,
  Train = 2,
  Bus = 3,
  Car = 4,
  Ferry = 5,
  Cruise = 6,
  Transportation = 7,

  // Accommodation
  Hotel = 20,
  Hostel = 21,
  Vacation = 22,
  Camping = 23,
  Lodging = 24,

  // Food & Drink
  Restaurant = 40,
  Cafe = 41,
  Bar = 42,
  Brewery = 43,
  Winery = 44,
  Bakery = 45,

  // Activities
  Sightseeing = 60,
  Museum = 61,
  Tour = 62,
  Concert = 63,
  Theater = 64,
  Event = 65,
  Beach = 66,
  Park = 67,
  AmusementPark = 68,
  Shopping = 69,

  // Services
  ATM = 80,
  Bank = 81,
  PostOffice = 82,
  Laundry = 83,
  GasStation = 84,
  EVCharger = 85,

  // Other
  Fitness = 100,
  Library = 101,
  Stadium = 102,
  Nightlife = 103,
  Other = 104,
}

export interface ActivityAttachment {
  id: string;
  fileMetadataId: string;
  description?: string;
  sortOrder: number;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  thumbnailUrl?: string;
  fileUrl?: string;
}

export interface ActivityBase {
  id?: string;
  name: string;
  description?: string;
  activityType: ActivityType;
  startDateTime?: string; // ISO string with timezone
  startTimezone?: string; // IANA timezone ID
  endDateTime?: string;
  endTimezone?: string;
  dayNumber?: number;
  startLocation?: string;
  endLocation?: string;
  address?: string;
  phoneNumber?: string;
  website?: string;
  cost?: number;
  currencyCode?: string;
  notes?: string;
  manualSortOrder?: number;
  attachments: ActivityAttachment[];
  createdAt?: string;
  lastModifiedAt?: string;
  createdByUserId?: string;
  lastModifiedByUserId?: string;
}

export interface FlightActivity extends ActivityBase {
  flightNumber?: string;
  airline?: string;
  seatNumber?: string;
  seatClass?: string;
  reservationCode?: string;
  departureGate?: string;
  arrivalGate?: string;
  departureTerminal?: string;
  arrivalTerminal?: string;
}

export interface LodgingActivity extends ActivityBase {
  reservationCode?: string;
  roomNumber?: string;
  roomType?: string;
  checkInTime?: string; // HH:mm format
  checkOutTime?: string;
  numberOfGuests?: number;
}

export interface TransportActivity extends ActivityBase {
  routeName?: string;
  transportNumber?: string;
  company?: string;
  departureStation?: string;
  arrivalStation?: string;
  reservationCode?: string;
  seatNumber?: string;
  seatClass?: string;
  coachNumber?: string;
  trainType?: string;
  cabinNumber?: string;
  cabinType?: string;
  deck?: string;
  departurePort?: string;
  arrivalPort?: string;
  vehicleIncluded?: boolean;
}

export interface CarRentalActivity extends ActivityBase {
  company?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  reservationCode?: string;
  vehicle?: string;
  vehicleClass?: string;
}

export interface ActivityOrderItem {
  activityId: string;
  manualSortOrder: number;
}

export interface CreateUpdateActivityRequest {
  name: string;
  description?: string;
  activityType: ActivityType;
  startDateTime?: string;
  startTimezone?: string;
  endDateTime?: string;
  endTimezone?: string;
  dayNumber?: number;
  startLocation?: string;
  endLocation?: string;
  address?: string;
  phoneNumber?: string;
  website?: string;
  cost?: number;
  currencyCode?: string;
  notes?: string;
  typeSpecificData?: any;
}

export interface DayActivityCount {
  date: string;
  activityCount: number;
}

export interface DayActivityCountIndexed {
  dayNumber: number;
  activityCount: number;
}

export interface CalendarSummaryResponse {
  daysWithActivities?: DayActivityCount[];
  daysWithActivitiesIndexed?: DayActivityCountIndexed[];
}

export type JourneyActivity =
  | ActivityBase
  | FlightActivity
  | LodgingActivity
  | TransportActivity
  | CarRentalActivity;

export interface ActivityDay {
  date: Date;
  hasActivities: boolean;
  dayNumber?: number;
}
