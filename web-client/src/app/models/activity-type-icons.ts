import { ActivityType } from './activity.model';

export const activityTypeIcons: Record<ActivityType, string> = {
  // Transportation
  [ActivityType.Flight]: 'plane',
  [ActivityType.Train]: 'train',
  [ActivityType.Bus]: 'bus',
  [ActivityType.Car]: 'car',
  [ActivityType.Ferry]: 'ship',
  [ActivityType.Cruise]: 'ship',
  [ActivityType.Transportation]: 'road',

  // Accommodation
  [ActivityType.Hotel]: 'hotel',
  [ActivityType.Hostel]: 'bed',
  [ActivityType.Vacation]: 'house-user',
  [ActivityType.Camping]: 'campground',
  [ActivityType.Lodging]: 'bed',

  // Food & Drink
  [ActivityType.Restaurant]: 'utensils',
  [ActivityType.Cafe]: 'coffee',
  [ActivityType.Bar]: 'wine-glass',

  // Activities & Entertainment
  [ActivityType.Sightseeing]: 'binoculars',
  [ActivityType.Museum]: 'museum',
  [ActivityType.Tour]: 'route',
  [ActivityType.Concert]: 'music',
  [ActivityType.Theater]: 'theater-masks',
  [ActivityType.Event]: 'calendar-check',
  [ActivityType.Beach]: 'umbrella-beach',
  [ActivityType.Park]: 'tree',
  [ActivityType.Entertainment]: 'theater-masks',
  [ActivityType.Activity]: 'person-running',

  // Services
  [ActivityType.Shopping]: 'shopping-bag',
  [ActivityType.Spa]: 'spa',
  [ActivityType.Fitness]: 'dumbbell',
  [ActivityType.Medical]: 'hospital',

  // Other
  [ActivityType.Meeting]: 'handshake',
  [ActivityType.Custom]: 'puzzle-piece',
  [ActivityType.Other]: 'circle-info',
};

export function getActivityTypeIcon(type: ActivityType): string {
  return activityTypeIcons[type] || 'circle-info';
}
