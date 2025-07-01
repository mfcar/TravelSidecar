import { JourneyActivity } from '../components/activities/day-activities-list/day-activities-list.component';

/**
 * Mock journey activities for testing
 */
export function generateMockActivities(journeyStartDate: Date): JourneyActivity[] {
  const startDate = new Date(journeyStartDate);

  const mockActivities: JourneyActivity[] = [
    {
      id: '1',
      name: 'Get Thailand Visa',
      description: 'Apply for Thailand visa at embassy',
      startDateTime: new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000),
      location: 'Thai Embassy',
      createdAt: new Date(),
      lastModifiedAt: new Date(),
    },
    {
      id: '2',
      name: 'Book Travel Insurance',
      description: 'Purchase travel insurance',
      startDateTime: new Date(startDate.getTime() - 25 * 24 * 60 * 60 * 1000),
      location: 'Online',
      cost: 150,
      currencyCode: 'EUR',
      createdAt: new Date(),
      lastModifiedAt: new Date(),
    },
    {
      id: '3',
      name: 'Pack Travel Documents',
      description: 'Organize passport, visa, insurance, tickets',
      startDateTime: new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000),
      location: 'Home',
      createdAt: new Date(),
      lastModifiedAt: new Date(),
    },
    {
      id: '4',
      name: 'Airport Check-in',
      description: 'Online check-in and seat selection',
      startDateTime: new Date(startDate.getTime() - 1 * 24 * 60 * 60 * 1000),
      location: 'Online',
      createdAt: new Date(),
      lastModifiedAt: new Date(),
    },
    {
      id: '5',
      name: 'Flight to Bangkok',
      description: 'Departure from home airport',
      startDateTime: new Date(startDate.getTime() + 6 * 60 * 60 * 1000), // 6 AM
      endDateTime: new Date(startDate.getTime() + 10 * 60 * 60 * 1000), // 10 AM
      location: 'Home Airport',
      cost: 1200,
      currencyCode: 'EUR',
      createdAt: new Date(),
      lastModifiedAt: new Date(),
    },
    {
      id: '6',
      name: 'Airport Transfer',
      description: 'Taxi to hotel',
      startDateTime: new Date(startDate.getTime() + 22 * 60 * 60 * 1000), // 10 PM
      endDateTime: new Date(startDate.getTime() + 23 * 60 * 60 * 1000), // 11 PM
      location: 'Suvarnabhumi Airport',
      cost: 500,
      currencyCode: 'THB',
      createdAt: new Date(),
      lastModifiedAt: new Date(),
    },
    {
      id: '7',
      name: 'Hotel Check-in',
      description: 'Check into hotel and rest',
      startDateTime: new Date(startDate.getTime() + 23 * 60 * 60 * 1000), // 11 PM
      location: 'Bangkok Hotel',
      createdAt: new Date(),
      lastModifiedAt: new Date(),
    },
    {
      id: '8',
      name: 'Early Morning Jog',
      description: 'Morning exercise at Lumpini Park',
      startDateTime: new Date(startDate.getTime() + 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000), // Day 2, 6 AM
      endDateTime: new Date(startDate.getTime() + 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000), // Day 2, 7 AM
      location: 'Lumpini Park',
      createdAt: new Date(),
      lastModifiedAt: new Date(),
    },
    {
      id: '9',
      name: 'Breakfast at Hotel',
      description: 'Traditional Thai breakfast',
      startDateTime: new Date(startDate.getTime() + 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000), // Day 2, 7 AM
      endDateTime: new Date(startDate.getTime() + 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000), // Day 2, 8 AM
      location: 'Bangkok Hotel Restaurant',
      cost: 300,
      currencyCode: 'THB',
      createdAt: new Date(),
      lastModifiedAt: new Date(),
    },
    {
      id: '10',
      name: 'Visit Grand Palace',
      description: 'Explore the magnificent Grand Palace complex',
      startDateTime: new Date(startDate.getTime() + 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000), // Day 2, 9 AM
      endDateTime: new Date(startDate.getTime() + 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000), // Day 2, 12 PM
      location: 'Grand Palace, Bangkok',
      cost: 500,
      currencyCode: 'THB',
      createdAt: new Date(),
      lastModifiedAt: new Date(),
    },
    {
      id: '11',
      name: 'Lunch at Street Food Market',
      description: 'Try authentic Thai street food',
      startDateTime: new Date(startDate.getTime() + 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000), // Day 2, 12 PM
      endDateTime: new Date(startDate.getTime() + 24 * 60 * 60 * 1000 + 13 * 60 * 60 * 1000), // Day 2, 1 PM
      location: 'Chatuchak Market',
      cost: 200,
      currencyCode: 'THB',
      createdAt: new Date(),
      lastModifiedAt: new Date(),
    },
    {
      id: '12',
      name: 'Temple Visit - Wat Pho',
      description: 'Visit the famous Temple of the Reclining Buddha',
      startDateTime: new Date(startDate.getTime() + 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000), // Day 2, 2 PM
      endDateTime: new Date(startDate.getTime() + 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000), // Day 2, 4 PM
      location: 'Wat Pho Temple',
      cost: 200,
      currencyCode: 'THB',
      createdAt: new Date(),
      lastModifiedAt: new Date(),
    },
    {
      id: '13',
      name: 'Coffee Break',
      description: 'Local coffee shop experience',
      startDateTime: new Date(startDate.getTime() + 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000), // Day 2, 5 PM
      endDateTime: new Date(startDate.getTime() + 24 * 60 * 60 * 1000 + 17.5 * 60 * 60 * 1000), // Day 2, 5:30 PM
      location: 'Local Coffee Shop',
      cost: 150,
      currencyCode: 'THB',
      createdAt: new Date(),
      lastModifiedAt: new Date(),
    },
    {
      id: '14',
      name: 'Shopping at MBK Center',
      description: 'Browse electronics and souvenirs',
      startDateTime: new Date(startDate.getTime() + 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000), // Day 2, 6 PM
      endDateTime: new Date(startDate.getTime() + 24 * 60 * 60 * 1000 + 19 * 60 * 60 * 1000), // Day 2, 7 PM
      location: 'MBK Center',
      cost: 1500,
      currencyCode: 'THB',
      createdAt: new Date(),
      lastModifiedAt: new Date(),
    },
    {
      id: '15',
      name: 'Dinner at Rooftop Restaurant',
      description: 'Fine dining with city views',
      startDateTime: new Date(startDate.getTime() + 24 * 60 * 60 * 1000 + 19 * 60 * 60 * 1000), // Day 2, 7 PM
      endDateTime: new Date(startDate.getTime() + 24 * 60 * 60 * 1000 + 21 * 60 * 60 * 1000), // Day 2, 9 PM
      location: 'Vertigo Rooftop Restaurant',
      cost: 2500,
      currencyCode: 'THB',
      createdAt: new Date(),
      lastModifiedAt: new Date(),
    },
    {
      id: '16',
      name: 'Night Market Walk',
      description: 'Explore the vibrant night market',
      startDateTime: new Date(startDate.getTime() + 24 * 60 * 60 * 1000 + 21 * 60 * 60 * 1000), // Day 2, 9 PM
      endDateTime: new Date(startDate.getTime() + 24 * 60 * 60 * 1000 + 23 * 60 * 60 * 1000), // Day 2, 11 PM
      location: 'Patpong Night Market',
      cost: 500,
      currencyCode: 'THB',
      createdAt: new Date(),
      lastModifiedAt: new Date(),
    },
    {
      id: '17',
      name: 'Day Trip to Ayutthaya',
      description: 'Explore ancient ruins and temples',
      startDateTime: new Date(startDate.getTime() + 48 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000), // Day 3, 8 AM
      endDateTime: new Date(startDate.getTime() + 48 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000), // Day 3, 6 PM
      location: 'Ayutthaya Historical Park',
      cost: 1500,
      currencyCode: 'THB',
      createdAt: new Date(),
      lastModifiedAt: new Date(),
    },
    {
      id: '18',
      name: 'Local Cooking Class',
      description: 'Learn to cook traditional Thai dishes',
      startDateTime: new Date(startDate.getTime() + 48 * 60 * 60 * 1000 + 19 * 60 * 60 * 1000), // Day 3, 7 PM
      endDateTime: new Date(startDate.getTime() + 48 * 60 * 60 * 1000 + 22 * 60 * 60 * 1000), // Day 3, 10 PM
      location: 'Bangkok Cooking School',
      cost: 2000,
      currencyCode: 'THB',
      createdAt: new Date(),
      lastModifiedAt: new Date(),
    },
    {
      id: '19',
      name: 'River Cruise',
      description: 'Scenic boat ride along Chao Phraya River',
      startDateTime: new Date(startDate.getTime() + 72 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000), // Day 4, 10 AM
      endDateTime: new Date(startDate.getTime() + 72 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000), // Day 4, 12 PM
      location: 'Chao Phraya River',
      cost: 800,
      currencyCode: 'THB',
      createdAt: new Date(),
      lastModifiedAt: new Date(),
    },
    {
      id: '20',
      name: 'Last Minute Shopping',
      description: 'Pick up final souvenirs',
      startDateTime: new Date(startDate.getTime() + 72 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000), // Day 4, 2 PM
      endDateTime: new Date(startDate.getTime() + 72 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000), // Day 4, 4 PM
      location: 'Airport Shopping Mall',
      cost: 1000,
      currencyCode: 'THB',
      createdAt: new Date(),
      lastModifiedAt: new Date(),
    },
    {
      id: '21',
      name: 'Flight Home',
      description: 'Return journey',
      startDateTime: new Date(startDate.getTime() + 72 * 60 * 60 * 1000 + 20 * 60 * 60 * 1000), // Day 4, 8 PM
      endDateTime: new Date(startDate.getTime() + 72 * 60 * 60 * 1000 + 23 * 60 * 60 * 1000), // Day 4, 11 PM
      location: 'Suvarnabhumi Airport',
      cost: 1200,
      currencyCode: 'EUR',
      createdAt: new Date(),
      lastModifiedAt: new Date(),
    },
    {
      id: '22',
      name: 'Share Trip Photos',
      description: 'Upload and share memories with friends',
      startDateTime: new Date(startDate.getTime() + 96 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000), // Day 5, 10 AM
      location: 'Home',
      createdAt: new Date(),
      lastModifiedAt: new Date(),
    },
    {
      id: '23',
      name: 'Plan Next Trip',
      description: 'Research destinations for next adventure',
      startDateTime: new Date(startDate.getTime() + 120 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000), // Day 6, 9 AM
      endDateTime: new Date(startDate.getTime() + 120 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000), // Day 6, 10 AM
      location: 'Home',
      createdAt: new Date(),
      lastModifiedAt: new Date(),
    },
    {
      id: '24',
      name: 'Travel Blog Writing',
      description: 'Write about Thailand trip experiences',
      startDateTime: new Date(startDate.getTime() + 120 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000), // Day 6, 10 AM
      endDateTime: new Date(startDate.getTime() + 120 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000), // Day 6, 12 PM
      location: 'Home',
      createdAt: new Date(),
      lastModifiedAt: new Date(),
    },
    {
      id: '25',
      name: 'Video Editing',
      description: 'Edit travel videos for social media',
      startDateTime: new Date(startDate.getTime() + 120 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000), // Day 6, 2 PM
      endDateTime: new Date(startDate.getTime() + 120 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000), // Day 6, 4 PM
      location: 'Home',
      createdAt: new Date(),
      lastModifiedAt: new Date(),
    },
    {
      id: '26',
      name: 'Thank You Cards',
      description: 'Send thank you notes to helpful locals',
      startDateTime: new Date(startDate.getTime() + 120 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000), // Day 6, 4 PM
      endDateTime: new Date(startDate.getTime() + 120 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000), // Day 6, 5 PM
      location: 'Home',
      createdAt: new Date(),
      lastModifiedAt: new Date(),
    },
    {
      id: '27',
      name: 'Travel Expense Review',
      description: 'Analyze trip costs and budget',
      startDateTime: new Date(startDate.getTime() + 120 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000), // Day 6, 6 PM
      endDateTime: new Date(startDate.getTime() + 120 * 60 * 60 * 1000 + 19 * 60 * 60 * 1000), // Day 6, 7 PM
      location: 'Home',
      createdAt: new Date(),
      lastModifiedAt: new Date(),
    },
  ];

  return mockActivities;
}

export function getActivityDates(activities: JourneyActivity[]): Date[] {
  const dates = new Set<string>();

  activities
    .filter((activity) => activity.startDateTime)
    .forEach((activity) => {
      const date = new Date(activity.startDateTime!);
      date.setHours(0, 0, 0, 0);
      dates.add(date.toISOString());
    });

  return Array.from(dates).map((dateStr) => new Date(dateStr));
}
