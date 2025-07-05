import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import {
  ActivityDay,
  ActivityOrderItem,
  CalendarSummaryResponse,
  CreateUpdateActivityRequest,
  JourneyActivity,
} from '../models/activities.model';
import { Journey } from '../models/journeys.model';

@Injectable({
  providedIn: 'root',
})
export class JourneyActivityService {
  private httpClient = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/journeys`;

  /**
   * Get all activities for a specific journey
   */
  getJourneyActivities(
    journeyId: string,
    sortMode: 'time' | 'manual' = 'manual',
  ): Observable<JourneyActivity[]> {
    return this.httpClient.get<JourneyActivity[]>(
      `${this.apiUrl}/${journeyId}/activities?sort=${sortMode}`,
      { withCredentials: true },
    );
  }

  /**
   * Get activities for a specific day
   */
  getActivitiesForDay(
    journeyId: string,
    day: Date | number,
    sortMode: 'time' | 'manual' = 'manual',
  ): Observable<JourneyActivity[]> {
    if (typeof day === 'number') {
      // Day number (for journeys without dates)
      return this.httpClient.get<JourneyActivity[]>(
        `${this.apiUrl}/${journeyId}/activities/day/${day}?sort=${sortMode}`,
        { withCredentials: true },
      );
    } else {
      // Specific date (for dated journeys)
      // Create a new date to avoid timezone issues
      const localDate = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      const dateStr = localDate.toISOString().split('T')[0];
      return this.httpClient.get<JourneyActivity[]>(
        `${this.apiUrl}/${journeyId}/activities/date/${dateStr}?sort=${sortMode}`,
        { withCredentials: true },
      );
    }
  }

  /**
   * Get calendar summary for a journey
   */
  getCalendarSummary(journeyId: string): Observable<CalendarSummaryResponse> {
    return this.httpClient.get<CalendarSummaryResponse>(
      `${this.apiUrl}/${journeyId}/activities/calendar-summary`,
      { withCredentials: true },
    );
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
    return this.getCalendarSummary(journeyId).pipe(
      map((summary) => {
        const days: ActivityDay[] = [];

        if (summary.daysWithActivities && startDate && endDate) {
          // For dated journeys with date range
          const current = new Date(startDate);

          while (current <= endDate) {
            const dateStr = current.toISOString().split('T')[0];
            const dayData = summary.daysWithActivities.find((d) => d.date === dateStr);

            days.push({
              date: new Date(current),
              hasActivities: dayData ? dayData.activityCount > 0 : false,
            });

            current.setDate(current.getDate() + 1);
          }
        } else if (summary.daysWithActivities) {
          // For dated journeys without specific range
          days.push(
            ...summary.daysWithActivities.map((d) => ({
              date: new Date(d.date),
              hasActivities: d.activityCount > 0,
            })),
          );
        } else if (summary.daysWithActivitiesIndexed) {
          // For undated journeys
          days.push(
            ...summary.daysWithActivitiesIndexed.map((d) => ({
              date: new Date(), // Placeholder date
              hasActivities: d.activityCount > 0,
              dayNumber: d.dayNumber,
            })),
          );
        }

        return days;
      }),
    );
  }

  /**
   * Get activity summary for a date range
   */
  getActivitySummary(
    journeyId: string,
    startDate: Date,
    endDate: Date,
  ): Observable<Map<string, number>> {
    return this.getCalendarSummary(journeyId).pipe(
      map((summary) => {
        const result = new Map<string, number>();

        if (summary.daysWithActivities) {
          summary.daysWithActivities
            .filter((day) => {
              const dayDate = new Date(day.date);
              return dayDate >= startDate && dayDate <= endDate;
            })
            .forEach((day) => {
              result.set(day.date, day.activityCount);
            });
        }

        return result;
      }),
    );
  }

  /**
   * Get a single activity by ID
   */
  getActivityById(journeyId: string, activityId: string): Observable<JourneyActivity> {
    return this.httpClient.get<JourneyActivity>(
      `${this.apiUrl}/${journeyId}/activities/${activityId}`,
      { withCredentials: true },
    );
  }

  /**
   * Create a new activity
   */
  createActivity(
    journeyId: string,
    request: CreateUpdateActivityRequest,
  ): Observable<JourneyActivity> {
    return this.httpClient.post<JourneyActivity>(
      `${this.apiUrl}/${journeyId}/activities`,
      request,
      { withCredentials: true },
    );
  }

  /**
   * Update an existing activity
   */
  updateActivity(
    journeyId: string,
    activityId: string,
    request: CreateUpdateActivityRequest,
  ): Observable<JourneyActivity> {
    return this.httpClient.put<JourneyActivity>(
      `${this.apiUrl}/${journeyId}/activities/${activityId}`,
      request,
      { withCredentials: true },
    );
  }

  /**
   * Delete an activity
   */
  deleteActivity(journeyId: string, activityId: string): Observable<boolean> {
    return this.httpClient.delete<boolean>(`${this.apiUrl}/${journeyId}/activities/${activityId}`, {
      withCredentials: true,
    });
  }

  /**
   * Reorder activities
   */
  reorderActivities(journeyId: string, activities: ActivityOrderItem[]): Observable<boolean> {
    return this.httpClient.put<boolean>(
      `${this.apiUrl}/${journeyId}/activities/reorder`,
      activities,
      { withCredentials: true },
    );
  }

  /**
   * Create activity from bucket list item
   */
  createActivityFromBucketListItem(
    journeyId: string,
    bucketListItemId: string,
    action: 'move' | 'duplicate',
    additionalData?: Partial<CreateUpdateActivityRequest>,
  ): Observable<JourneyActivity> {
    return this.httpClient.post<JourneyActivity>(
      `${this.apiUrl}/${journeyId}/activities/from-bucket-list/${bucketListItemId}?action=${action}`,
      additionalData || {},
      { withCredentials: true },
    );
  }

  /**
   * Helper to format date as YYYY-MM-DD
   */
  private formatDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
