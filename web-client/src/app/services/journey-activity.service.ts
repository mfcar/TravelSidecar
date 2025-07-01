import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { JourneyActivity } from '../components/activities/day-activities-list/day-activities-list.component';
import { generateMockActivities, getActivityDates } from '../mocks/journey-activities.mock';
import { Journey } from '../models/journeys.model';

export interface ActivityDay {
  date: Date;
  hasActivities: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class JourneyActivityService {
  private mockActivitiesCache = new Map<string, JourneyActivity[]>();

  /**
   * Get all activities for a specific journey
   */
  getJourneyActivities(journeyId: string, journey?: Journey): Observable<JourneyActivity[]> {
    if (this.mockActivitiesCache.has(journeyId)) {
      return of(this.mockActivitiesCache.get(journeyId)!).pipe(delay(300));
    }

    let activities: JourneyActivity[] = [];

    if (journey?.startDate) {
      activities = generateMockActivities(new Date(journey.startDate));
    } else {
      activities = generateMockActivities(new Date());
    }

    this.mockActivitiesCache.set(journeyId, activities);

    return of(activities).pipe(delay(300));
  }

  /**
   * Get activities for a specific day
   */
  getActivitiesForDay(
    journeyId: string,
    day: Date | number,
    journey?: Journey,
  ): Observable<JourneyActivity[]> {
    return new Observable((observer) => {
      this.getJourneyActivities(journeyId, journey).subscribe((allActivities) => {
        const dayActivities = this.filterActivitiesByDay(allActivities, day);
        observer.next(dayActivities);
        observer.complete();
      });
    });
  }

  /**
   * Get which days have activities for a journey
   */
  getActivityDays(
    journeyId: string,
    journey?: Journey,
    startDate?: Date,
    endDate?: Date,
  ): Observable<ActivityDay[]> {
    return new Observable((observer) => {
      this.getJourneyActivities(journeyId, journey).subscribe((allActivities) => {
        const activityDates = getActivityDates(allActivities);

        if (startDate && endDate) {
          const days: ActivityDay[] = [];
          const current = new Date(startDate);

          while (current <= endDate) {
            const hasActivities = activityDates.some((activityDate) =>
              this.isSameDay(activityDate, current),
            );

            days.push({
              date: new Date(current),
              hasActivities,
            });

            current.setDate(current.getDate() + 1);
          }

          observer.next(days);
        } else {
          const days: ActivityDay[] = activityDates.map((date) => ({
            date,
            hasActivities: true,
          }));

          observer.next(days);
        }

        observer.complete();
      });
    });
  }

  /**
   * Get activity summary for a date range (useful for calendar and pagination views)
   */
  getActivitySummary(
    journeyId: string,
    startDate: Date,
    endDate: Date,
    journey?: Journey,
  ): Observable<Map<string, number>> {
    return new Observable((observer) => {
      this.getJourneyActivities(journeyId, journey).subscribe((allActivities) => {
        const summary = new Map<string, number>();

        allActivities
          .filter((activity) => {
            if (!activity.startDateTime) return false;
            const activityDate = new Date(activity.startDateTime);
            return activityDate >= startDate && activityDate <= endDate;
          })
          .forEach((activity) => {
            const dayKey = this.formatDateKey(new Date(activity.startDateTime!));
            summary.set(dayKey, (summary.get(dayKey) || 0) + 1);
          });

        observer.next(summary);
        observer.complete();
      });
    });
  }

  /**
   * Filter activities by a specific day
   */
  private filterActivitiesByDay(
    activities: JourneyActivity[],
    day: Date | number,
  ): JourneyActivity[] {
    if (day instanceof Date) {
      const targetDate = new Date(day);
      targetDate.setHours(0, 0, 0, 0);

      return activities.filter((activity) => {
        if (!activity.startDateTime) return false;

        const activityDate = new Date(activity.startDateTime);
        activityDate.setHours(0, 0, 0, 0);

        return activityDate.getTime() === targetDate.getTime();
      });
    }

    return [];
  }

  /**
   * Check if two dates are the same day
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    return d1.getTime() === d2.getTime();
  }

  /**
   * Format date as YYYY-MM-DD for use as map key
   */
  private formatDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Clear cache for a journey (useful when activities are updated)
   */
  clearJourneyCache(journeyId: string): void {
    this.mockActivitiesCache.delete(journeyId);
  }

  /**
   * Clear all cache
   */
  clearAllCache(): void {
    this.mockActivitiesCache.clear();
  }
}
