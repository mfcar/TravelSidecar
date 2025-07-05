import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { JourneyActivity, ActivityOrderItem } from '../../../models/activities.model';
import { UserPreferences, UserTimeFormat } from '../../../models/user.model';
import { UserPreferencesService } from '../../../services/user-preferences.service';
import { ActivityTypeUtils } from '../../../utils/activity-type.utils';
import { TimezoneUtils } from '../../../utils/timezone.utils';
import { ButtonComponent } from '../../buttons/button/button.component';

export interface ActivityStackListConfig {
  showTimezone?: boolean;
  showCost?: boolean;
  showLocation?: boolean;
  showType?: boolean;
  enableDragDrop?: boolean;
  enableMultiSelect?: boolean;
  enableExpand?: boolean;
}

@Component({
  selector: 'ts-activity-stack-list',
  imports: [NgClass, FontAwesomeModule, ButtonComponent, DragDropModule],
  templateUrl: './activity-stack-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityStackListComponent {
  activities = input.required<JourneyActivity[]>();
  config = input<ActivityStackListConfig>({
    showTimezone: true,
    showCost: true,
    showLocation: true,
    showType: true,
    enableDragDrop: false,
    enableMultiSelect: false,
    enableExpand: true,
  });
  isLoading = input<boolean>(false);
  sortMode = input<'time' | 'manual'>('manual');

  // Outputs
  editActivity = output<JourneyActivity>();
  deleteActivity = output<string>();
  viewActivity = output<JourneyActivity>();
  reorderActivities = output<ActivityOrderItem[]>();
  selectedActivitiesChange = output<Set<string>>();

  // State
  expandedActivityIds = signal<Set<string>>(new Set());
  selectedActivityIds = signal<Set<string>>(new Set());

  // Services
  private userPreferencesService = inject(UserPreferencesService);

  // User preferences
  userPreferences = computed(() => this.userPreferencesService.preferences());

  isActivityExpanded(activityId: string | undefined): boolean {
    return !!activityId && this.expandedActivityIds().has(activityId);
  }

  toggleActivityExpansion(activityId: string | undefined): void {
    if (!activityId) return;

    const expanded = new Set(this.expandedActivityIds());
    if (expanded.has(activityId)) {
      expanded.delete(activityId);
    } else {
      expanded.add(activityId);
    }
    this.expandedActivityIds.set(expanded);
  }

  isActivitySelected(activityId: string | undefined): boolean {
    return !!activityId && this.selectedActivityIds().has(activityId);
  }

  toggleActivitySelection(activityId: string | undefined): void {
    if (!activityId || !this.config().enableMultiSelect) return;

    const selected = new Set(this.selectedActivityIds());
    if (selected.has(activityId)) {
      selected.delete(activityId);
    } else {
      selected.add(activityId);
    }
    this.selectedActivityIds.set(selected);
    this.selectedActivitiesChange.emit(selected);
  }

  selectAllActivities(): void {
    if (!this.config().enableMultiSelect) return;

    const allIds = new Set(
      this.activities()
        .map((a) => a.id)
        .filter((id): id is string => !!id),
    );
    this.selectedActivityIds.set(allIds);
    this.selectedActivitiesChange.emit(allIds);
  }

  clearSelection(): void {
    this.selectedActivityIds.set(new Set());
    this.selectedActivitiesChange.emit(new Set());
  }

  onDrop(event: CdkDragDrop<JourneyActivity[]>): void {
    if (!this.config().enableDragDrop || this.sortMode() !== 'manual') return;

    const activities = [...this.activities()];
    moveItemInArray(activities, event.previousIndex, event.currentIndex);

    // Emit reorder event with new order
    const orderItems: ActivityOrderItem[] = activities
      .map((activity, index) => ({
        activityId: activity.id!,
        manualSortOrder: index,
      }))
      .filter((item) => item.activityId);

    this.reorderActivities.emit(orderItems);
  }

  getActivityIcon(activity: JourneyActivity): string {
    return ActivityTypeUtils.getActivityTypeIcon(activity.activityType);
  }

  getActivityTypeName(activity: JourneyActivity): string {
    return ActivityTypeUtils.getActivityTypeName(activity.activityType);
  }

  formatTime(activity: JourneyActivity, userPrefs: UserPreferences | null): string {
    if (!activity.startDateTime || !activity.startTimezone || !userPrefs) {
      return '';
    }

    const formatted = TimezoneUtils.formatTime(
      activity.startDateTime,
      activity.startTimezone,
      userPrefs.userTimezone,
      userPrefs.userTimeFormat || UserTimeFormat.HH_MM_12,
      userPrefs.locale || 'en-US',
    );

    if (!formatted) return '';

    if (this.config().showTimezone && formatted.isDifferentTimezone && formatted.userTime) {
      return `${formatted.localTime} (${formatted.userTime} your time)`;
    }

    return formatted.localTime;
  }

  formatCost(activity: JourneyActivity): string {
    if (!activity.cost || activity.cost <= 0) return '';

    const currency = activity.currencyCode || 'USD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(activity.cost);
  }

  getLocation(activity: JourneyActivity): string {
    return activity.address || activity.startLocation || '';
  }

  hasAttachments(activity: JourneyActivity): boolean {
    return !!(activity.attachments && activity.attachments.length > 0);
  }

  getAttachmentCount(activity: JourneyActivity): number {
    return activity.attachments?.length || 0;
  }

  onEditClick(activity: JourneyActivity): void {
    this.editActivity.emit(activity);
  }

  onDeleteClick(activityId: string | undefined): void {
    if (activityId) {
      this.deleteActivity.emit(activityId);
    }
  }

  onViewClick(activity: JourneyActivity): void {
    this.viewActivity.emit(activity);
  }

  trackByActivityId(_: number, activity: JourneyActivity): string {
    return activity.id || '';
  }
}