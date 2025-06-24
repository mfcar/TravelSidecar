import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

export enum ActivitiesViewMode {
  ByTime = 'byTime',
  Manual = 'manual',
}

export interface JourneyActivity {
  id: string;
  name: string;
  description?: string;
  startDateTime?: Date;
  endDateTime?: Date;
  location?: string;
  cost?: number;
  currencyCode?: string;
  dayIndex?: number;
  createdAt: Date;
  lastModifiedAt: Date;
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

  onEditActivity(activity: JourneyActivity): void {
    this.editActivity.emit(activity);
  }

  onDeleteActivity(activityId: string): void {
    this.deleteActivity.emit(activityId);
  }

  formatTime(date?: Date): string {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  formatCost(cost?: number, currencyCode?: string): string {
    if (!cost) return '';
    const currency = currencyCode || 'USD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(cost);
  }

  readonly ActivitiesViewMode = ActivitiesViewMode;
}
