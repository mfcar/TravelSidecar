import { ActivityType } from '../models/activities.model';

export interface ActivityTypeInfo {
  type: ActivityType;
  name: string;
  icon: string;
  category: 'transportation' | 'accommodation' | 'food' | 'activities' | 'services' | 'other';
}

export class ActivityTypeUtils {
  private static readonly activityTypeMap = new Map<ActivityType, ActivityTypeInfo>([
    // Transportation
    [
      ActivityType.Flight,
      { type: ActivityType.Flight, name: 'Flight', icon: 'faPlane', category: 'transportation' },
    ],
    [
      ActivityType.Train,
      { type: ActivityType.Train, name: 'Train', icon: 'faTrain', category: 'transportation' },
    ],
    [
      ActivityType.Bus,
      { type: ActivityType.Bus, name: 'Bus', icon: 'faBus', category: 'transportation' },
    ],
    [
      ActivityType.Car,
      { type: ActivityType.Car, name: 'Car Rental', icon: 'faCar', category: 'transportation' },
    ],
    [
      ActivityType.Ferry,
      { type: ActivityType.Ferry, name: 'Ferry', icon: 'faShip', category: 'transportation' },
    ],
    [
      ActivityType.Cruise,
      { type: ActivityType.Cruise, name: 'Cruise', icon: 'faShip', category: 'transportation' },
    ],
    [
      ActivityType.Transportation,
      {
        type: ActivityType.Transportation,
        name: 'Transportation',
        icon: 'faRoute',
        category: 'transportation',
      },
    ],

    // Accommodation
    [
      ActivityType.Hotel,
      { type: ActivityType.Hotel, name: 'Hotel', icon: 'faBed', category: 'accommodation' },
    ],
    [
      ActivityType.Hostel,
      { type: ActivityType.Hostel, name: 'Hostel', icon: 'faBed', category: 'accommodation' },
    ],
    [
      ActivityType.Vacation,
      {
        type: ActivityType.Vacation,
        name: 'Vacation Rental',
        icon: 'faHouse',
        category: 'accommodation',
      },
    ],
    [
      ActivityType.Camping,
      {
        type: ActivityType.Camping,
        name: 'Camping',
        icon: 'faCampground',
        category: 'accommodation',
      },
    ],
    [
      ActivityType.Lodging,
      { type: ActivityType.Lodging, name: 'Lodging', icon: 'faBed', category: 'accommodation' },
    ],

    // Food & Drink
    [
      ActivityType.Restaurant,
      { type: ActivityType.Restaurant, name: 'Restaurant', icon: 'faUtensils', category: 'food' },
    ],
    [
      ActivityType.Cafe,
      { type: ActivityType.Cafe, name: 'Cafe', icon: 'faCoffee', category: 'food' },
    ],
    [
      ActivityType.Bar,
      { type: ActivityType.Bar, name: 'Bar', icon: 'faWineGlass', category: 'food' },
    ],
    [
      ActivityType.Brewery,
      { type: ActivityType.Brewery, name: 'Brewery', icon: 'faBeer', category: 'food' },
    ],
    [
      ActivityType.Winery,
      { type: ActivityType.Winery, name: 'Winery', icon: 'faWineBottle', category: 'food' },
    ],
    [
      ActivityType.Bakery,
      { type: ActivityType.Bakery, name: 'Bakery', icon: 'faBreadSlice', category: 'food' },
    ],

    // Activities
    [
      ActivityType.Sightseeing,
      {
        type: ActivityType.Sightseeing,
        name: 'Sightseeing',
        icon: 'faCamera',
        category: 'activities',
      },
    ],
    [
      ActivityType.Museum,
      { type: ActivityType.Museum, name: 'Museum', icon: 'faMuseum', category: 'activities' },
    ],
    [
      ActivityType.Tour,
      { type: ActivityType.Tour, name: 'Tour', icon: 'faMapMarked', category: 'activities' },
    ],
    [
      ActivityType.Concert,
      { type: ActivityType.Concert, name: 'Concert', icon: 'faMusic', category: 'activities' },
    ],
    [
      ActivityType.Theater,
      {
        type: ActivityType.Theater,
        name: 'Theater',
        icon: 'faTheaterMasks',
        category: 'activities',
      },
    ],
    [
      ActivityType.Event,
      { type: ActivityType.Event, name: 'Event', icon: 'faCalendarCheck', category: 'activities' },
    ],
    [
      ActivityType.Beach,
      { type: ActivityType.Beach, name: 'Beach', icon: 'faUmbrellaBeach', category: 'activities' },
    ],
    [
      ActivityType.Park,
      { type: ActivityType.Park, name: 'Park', icon: 'faTree', category: 'activities' },
    ],
    [
      ActivityType.AmusementPark,
      {
        type: ActivityType.AmusementPark,
        name: 'Amusement Park',
        icon: 'faDharmachakra',
        category: 'activities',
      },
    ],
    [
      ActivityType.Shopping,
      {
        type: ActivityType.Shopping,
        name: 'Shopping',
        icon: 'faShoppingBag',
        category: 'activities',
      },
    ],

    // Services
    [
      ActivityType.ATM,
      { type: ActivityType.ATM, name: 'ATM', icon: 'faCreditCard', category: 'services' },
    ],
    [
      ActivityType.Bank,
      { type: ActivityType.Bank, name: 'Bank', icon: 'faUniversity', category: 'services' },
    ],
    [
      ActivityType.PostOffice,
      {
        type: ActivityType.PostOffice,
        name: 'Post Office',
        icon: 'faEnvelope',
        category: 'services',
      },
    ],
    [
      ActivityType.Laundry,
      { type: ActivityType.Laundry, name: 'Laundry', icon: 'faTshirt', category: 'services' },
    ],
    [
      ActivityType.GasStation,
      {
        type: ActivityType.GasStation,
        name: 'Gas Station',
        icon: 'faGasPump',
        category: 'services',
      },
    ],
    [
      ActivityType.EVCharger,
      {
        type: ActivityType.EVCharger,
        name: 'EV Charger',
        icon: 'faChargingStation',
        category: 'services',
      },
    ],

    // Other
    [
      ActivityType.Fitness,
      { type: ActivityType.Fitness, name: 'Fitness', icon: 'faDumbbell', category: 'other' },
    ],
    [
      ActivityType.Library,
      { type: ActivityType.Library, name: 'Library', icon: 'faBook', category: 'other' },
    ],
    [
      ActivityType.Stadium,
      { type: ActivityType.Stadium, name: 'Stadium', icon: 'faFutbol', category: 'other' },
    ],
    [
      ActivityType.Nightlife,
      { type: ActivityType.Nightlife, name: 'Nightlife', icon: 'faMoon', category: 'other' },
    ],
    [
      ActivityType.Other,
      { type: ActivityType.Other, name: 'Other', icon: 'faEllipsis', category: 'other' },
    ],
  ]);

  static getActivityTypeInfo(type: ActivityType): ActivityTypeInfo {
    return (
      this.activityTypeMap.get(type) || {
        type: ActivityType.Other,
        name: 'Other',
        icon: 'faEllipsis',
        category: 'other',
      }
    );
  }

  static getActivityTypeName(type: ActivityType): string {
    return this.getActivityTypeInfo(type).name;
  }

  static getActivityTypeIcon(type: ActivityType): string {
    return this.getActivityTypeInfo(type).icon;
  }

  static getActivityTypesByCategory(
    category: 'transportation' | 'accommodation' | 'food' | 'activities' | 'services' | 'other',
  ): ActivityTypeInfo[] {
    return Array.from(this.activityTypeMap.values()).filter((info) => info.category === category);
  }

  static getAllActivityTypes(): ActivityTypeInfo[] {
    return Array.from(this.activityTypeMap.values());
  }

  static getGroupedActivityTypes(): Record<string, ActivityTypeInfo[]> {
    const groups: Record<string, ActivityTypeInfo[]> = {
      transportation: [],
      accommodation: [],
      food: [],
      activities: [],
      services: [],
      other: [],
    };

    this.activityTypeMap.forEach((info) => {
      groups[info.category].push(info);
    });

    return groups;
  }

  /**
   * Determine if an activity type typically has start and end locations
   */
  static hasLocationFields(type: ActivityType): boolean {
    return [
      ActivityType.Flight,
      ActivityType.Train,
      ActivityType.Bus,
      ActivityType.Car,
      ActivityType.Ferry,
      ActivityType.Cruise,
      ActivityType.Transportation,
    ].includes(type);
  }

  /**
   * Determine if an activity type typically has reservation codes
   */
  static hasReservationCode(type: ActivityType): boolean {
    return [
      ActivityType.Flight,
      ActivityType.Train,
      ActivityType.Bus,
      ActivityType.Car,
      ActivityType.Ferry,
      ActivityType.Cruise,
      ActivityType.Hotel,
      ActivityType.Hostel,
      ActivityType.Vacation,
      ActivityType.Lodging,
    ].includes(type);
  }
}
