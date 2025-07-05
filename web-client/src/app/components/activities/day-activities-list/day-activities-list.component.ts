import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { JourneyActivity } from '../../../models/activities.model';

export enum ActivitiesViewMode {
  ByTime = 'byTime',
  Manual = 'manual',
}

@Component({
  selector: 'ts-day-activities-list',
  imports: [FontAwesomeModule],
  templateUrl: './day-activities-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DayActivitiesListComponent {
  activities = input<JourneyActivity[]>([]);
  viewMode = input<ActivitiesViewMode>(ActivitiesViewMode.ByTime);
  isLoading = input<boolean>(false);

  editActivity = output<JourneyActivity>();
  deleteActivity = output<string>();
  reorderActivities = output<JourneyActivity[]>();

  expandedActivityId = signal<string | null>(null);

  onEditActivity(activity: JourneyActivity): void {
    this.editActivity.emit(activity);
  }

  onDeleteActivity(activityId: string | undefined): void {
    if (activityId) {
      this.deleteActivity.emit(activityId);
    }
  }

  onToggleActivityDetails(activityId: string | undefined): void {
    if (!activityId) return;

    if (this.expandedActivityId() === activityId) {
      this.expandedActivityId.set(null);
    } else {
      this.expandedActivityId.set(activityId);
    }
  }

  isActivityExpanded(activityId: string | undefined): boolean {
    return !!activityId && this.expandedActivityId() === activityId;
  }

  formatTime(dateTime?: string): string {
    if (!dateTime) return '';
    try {
      const date = new Date(dateTime);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return '';
    }
  }

  formatCost(cost?: number, currencyCode?: string): string {
    if (!cost) return '';
    const currency = currencyCode || 'USD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(cost);
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return '';
    }
  }

  readonly ActivitiesViewMode = ActivitiesViewMode;
}
