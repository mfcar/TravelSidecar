import { Dialog } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { filter, of, take, tap } from 'rxjs';
import {
  ActivitiesViewMode,
  ActivitiesViewToggleComponent,
} from '../../../components/activities/activities-view-toggle/activities-view-toggle.component';
import { DayActivitiesListComponent } from '../../../components/activities/day-activities-list/day-activities-list.component';
import { ButtonComponent } from '../../../components/buttons/button/button.component';
import {
  BucketListPickerComponent,
  BucketListPickerConfig,
  BucketListPickerResult,
} from '../../../components/forms/bucket-list-picker/bucket-list-picker.component';
import {
  ActivityModalComponent,
  ActivityModalData,
} from '../../../components/modals/activities/activity-modal.component';
import {
  DayNavigatorMode,
  DaysNavigatorComponent,
} from '../../../components/navigation/days-navigator/days-navigator.component';
import { CollapsibleSectionComponent } from '../../../components/ui/collapsible-section/collapsible-section.component';
import { JourneyActivity } from '../../../models/activities.model';
import { UserFirstDayOfWeek } from '../../../models/enums/user-preferences.enum';
import { BucketListService } from '../../../services/bucket-list.service';
import { JourneyActivityService } from '../../../services/journey-activity.service';
import { JourneyService } from '../../../services/journey.service';
import { ToastService } from '../../../services/toast.service';
import { UserPreferencesService } from '../../../services/user-preferences.service';

@Component({
  selector: 'ts-journey-activities',
  imports: [
    FontAwesomeModule,
    DaysNavigatorComponent,
    ActivitiesViewToggleComponent,
    DayActivitiesListComponent,
    ButtonComponent,
    CollapsibleSectionComponent,
  ],
  templateUrl: './journey-activities.page.html',
  styles: `
    .h-screen-minus-navbar {
      height: calc(100vh - 200px);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JourneyActivitiesPage {
  private route = inject(ActivatedRoute);
  private journeyService = inject(JourneyService);
  private journeyActivityService = inject(JourneyActivityService);
  private userPreferencesService = inject(UserPreferencesService);
  private dialog = inject(Dialog);
  private bucketListService = inject(BucketListService);
  private toastService = inject(ToastService);

  daysNavigator = viewChild<DaysNavigatorComponent>('daysNavigator');
  activitiesScrollContainer = viewChild<HTMLElement>('activitiesScrollContainer');

  journeyId = computed(() => this.route.parent?.snapshot.paramMap.get('id'));

  journeyResource = rxResource({
    request: () => this.journeyId(),
    loader: ({ request }) => {
      return this.journeyService.getJourneyById(request!);
    },
  });

  journey = computed(() => this.journeyResource.value());

  selectedDay = signal<Date | number>(new Date());
  dayNavigatorMode = signal<DayNavigatorMode>(DayNavigatorMode.Pagination);
  activitiesViewMode = signal<ActivitiesViewMode>(ActivitiesViewMode.ByTime);
  firstDayOfWeek = signal<UserFirstDayOfWeek>(UserFirstDayOfWeek.Monday);
  visibleDateRange = signal<{ startDate: Date; endDate: Date } | null>(null);
  
  // Scroll state for indicators
  scrolledTop = signal(false);
  scrolledBottom = signal(false);

  // Replace signals with computed for derived state
  allActivities = computed(() => this.activitiesResource.value() || []);
  isLoadingActivities = computed(() => this.dayActivitiesResource.isLoading());
  activitySummary = computed(() => {
    // Use visible range summary if we have a visible date range
    const visibleRange = this.visibleDateRange();
    if (visibleRange) {
      const rangeSummary = this.visibleRangeSummaryResource.value();
      if (rangeSummary) {
        return rangeSummary;
      }
    }

    // Fall back to full calendar summary
    const summary = this.calendarSummaryResource.value();
    if (!summary) return new Map<string, number>();

    const summaryMap = new Map<string, number>();
    if (summary.daysWithActivities) {
      summary.daysWithActivities.forEach((day) => {
        summaryMap.set(day.date, day.activityCount);
      });
    }
    return summaryMap;
  });

  activitiesResource = rxResource({
    request: () => ({ journeyId: this.journeyId(), journey: this.journey() }),
    loader: ({ request }) => {
      if (!request.journeyId) {
        return of([]);
      }
      return this.journeyActivityService.getJourneyActivities(request.journeyId);
    },
  });

  calendarSummaryResource = rxResource({
    request: () => this.journeyId(),
    loader: ({ request }) => {
      if (!request) {
        return of({ daysWithActivities: [], daysWithActivitiesIndexed: [] });
      }
      return this.journeyActivityService.getCalendarSummary(request);
    },
  });

  // Resource to fetch activity summary for visible date range
  visibleRangeSummaryResource = rxResource({
    request: () => ({
      journeyId: this.journeyId(),
      range: this.visibleDateRange(),
    }),
    loader: ({ request }) => {
      if (!request.journeyId || !request.range) {
        return of(new Map<string, number>());
      }
      return this.journeyActivityService.getActivitySummary(
        request.journeyId,
        request.range.startDate,
        request.range.endDate,
      );
    },
  });

  dayActivitiesResource = rxResource({
    request: () => ({
      journeyId: this.journeyId(),
      day: this.selectedDay(),
    }),
    loader: ({ request }) => {
      if (!request.journeyId || !request.day) {
        return of([]);
      }
      return this.journeyActivityService.getActivitiesForDay(request.journeyId, request.day);
    },
  });

  currentDayActivities = computed(() => {
    return this.dayActivitiesResource.value() || [];
  });

  constructor() {
    this.loadUserPreferences();

    // Initialize selected day after journey loads
    // Using toSignal to convert the observable to a signal for reactive initialization
    const journeyLoaded$ = toObservable(this.journey).pipe(
      filter((journey) => !!journey),
      take(1),
      tap(() => this.setInitialSelectedDay()),
    );

    toSignal(journeyLoaded$, { initialValue: null });
  }

  private loadUserPreferences(): void {
    const savedActivitiesViewMode = localStorage.getItem(
      'journey_activitiesViewMode',
    ) as ActivitiesViewMode;
    if (
      savedActivitiesViewMode &&
      Object.values(ActivitiesViewMode).includes(savedActivitiesViewMode)
    ) {
      this.activitiesViewMode.set(savedActivitiesViewMode);
    }

    const savedDayNavigatorMode = localStorage.getItem(
      'journey_dayNavigatorMode',
    ) as DayNavigatorMode;
    if (savedDayNavigatorMode && Object.values(DayNavigatorMode).includes(savedDayNavigatorMode)) {
      this.dayNavigatorMode.set(savedDayNavigatorMode);
    }

    const savedFirstDayOfWeek = localStorage.getItem('user_firstDayOfWeek');
    if (
      savedFirstDayOfWeek &&
      Object.values(UserFirstDayOfWeek).includes(Number(savedFirstDayOfWeek))
    ) {
      this.firstDayOfWeek.set(Number(savedFirstDayOfWeek) as UserFirstDayOfWeek);
    }
  }

  private setInitialSelectedDay(): void {
    const j = this.journey();
    if (!j) return;

    const firstActivityDate = this.getFirstActivityDate();

    if (j.startDate) {
      const journeyStart = new Date(j.startDate);

      if (firstActivityDate && firstActivityDate < journeyStart) {
        this.selectedDay.set(firstActivityDate);
      } else {
        this.selectedDay.set(journeyStart);
      }
    } else {
      this.selectedDay.set(1);
    }

    // Update visible range after setting initial day
    setTimeout(() => this.updateVisibleRange(), 0);
  }

  private getFirstActivityDate(): Date | null {
    const activities = this.allActivities();
    if (activities.length === 0) return null;

    const datedActivities = activities
      .filter((a) => a.startDateTime)
      .map((a) => new Date(a.startDateTime!))
      .sort((a, b) => a.getTime() - b.getTime());

    return datedActivities[0] || null;
  }

  onDayChange(day: Date | number): void {
    this.selectedDay.set(day);
    console.log('Day changed to:', day);
  }

  onDayNavigatorModeChange(mode: DayNavigatorMode): void {
    this.dayNavigatorMode.set(mode);
    localStorage.setItem('journey_dayNavigatorMode', mode);
    console.log('Day navigator mode changed to:', mode);
    // Update visible range when view mode changes
    setTimeout(() => this.updateVisibleRange(), 0);
  }

  onActivitiesViewModeChange(mode: ActivitiesViewMode): void {
    this.activitiesViewMode.set(mode);
    localStorage.setItem('journey_activitiesViewMode', mode);
    console.log('Activities view mode changed to:', mode);
  }

  onPageChange(pageIndex: number): void {
    console.log('Page changed to:', pageIndex);
    this.updateVisibleRange();
  }

  onMonthChange(month: Date): void {
    console.log('Month changed to:', month);
    this.updateVisibleRange();
  }

  private updateVisibleRange(): void {
    const navigator = this.daysNavigator();
    if (navigator) {
      const range = navigator.getVisibleDateRange();
      this.visibleDateRange.set(range);
    }
  }

  onEditActivity(activity: JourneyActivity): void {
    const journeyId = this.journeyId();
    if (!journeyId) return;

    const modalData: ActivityModalData = {
      journeyId,
      activity,
      mode: 'edit',
    };

    const dialogRef = this.dialog.open<JourneyActivity>(ActivityModalComponent, {
      data: modalData,
      width: '700px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'activity-modal-dialog',
      restoreFocus: true,
      autoFocus: true,
      ariaModal: true,
    });

    dialogRef.closed.subscribe((result) => {
      if (result) {
        // Refresh activities
        this.activitiesResource.reload();
        this.dayActivitiesResource.reload();
        this.calendarSummaryResource.reload();
        this.visibleRangeSummaryResource.reload();
      }
    });
  }

  onDeleteActivity(activityId: string): void {
    const journeyId = this.journeyId();
    if (!journeyId) return;

    if (confirm('Are you sure you want to delete this activity?')) {
      this.journeyActivityService.deleteActivity(journeyId, activityId).subscribe({
        next: () => {
          this.toastService.showSuccess('Activity deleted successfully');
          // Refresh activities
          this.activitiesResource.reload();
          this.dayActivitiesResource.reload();
          this.calendarSummaryResource.reload();
        },
        error: (error) => {
          console.error('Error deleting activity:', error);
          this.toastService.showError('Failed to delete activity. Please try again.');
        },
      });
    }
  }

  onReorderActivities(activities: JourneyActivity[]): void {
    console.log('Reorder activities:', activities);
  }

  openAddActivityModal(): void {
    const journeyId = this.journeyId();
    if (!journeyId) return;

    const modalData: ActivityModalData = {
      journeyId,
      selectedDay: this.selectedDay(),
      mode: 'create',
    };

    const dialogRef = this.dialog.open<JourneyActivity>(ActivityModalComponent, {
      data: modalData,
      width: '700px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'activity-modal-dialog',
      restoreFocus: true,
      autoFocus: true,
      ariaModal: true,
    });

    dialogRef.closed.subscribe((result) => {
      if (result) {
        // Refresh activities
        this.activitiesResource.reload();
        this.dayActivitiesResource.reload();
        this.calendarSummaryResource.reload();
        this.visibleRangeSummaryResource.reload();
      }
    });
  }

  openBucketListPicker(): void {
    const journeyId = this.journeyId();
    if (!journeyId) return;

    const config: BucketListPickerConfig = {
      mode: 'copy',
      allowMultiple: true,
      journeyId: journeyId,
    };

    const dialogRef = this.dialog.open<BucketListPickerResult>(BucketListPickerComponent, {
      data: config,
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'bucket-list-picker-dialog',
    });

    dialogRef.closed.subscribe((result) => {
      if (result) {
        const itemIds = result.items.map((item) => item.id);

        this.bucketListService.copyToJourney(itemIds, journeyId, result.action).subscribe({
          next: () => {
            this.toastService.showSuccess(
              `Successfully ${result.action === 'move' ? 'moved' : 'copied'} ${result.items.length} items to journey`,
            );

            // Refresh activities
            this.activitiesResource.reload();
            this.dayActivitiesResource.reload();
            this.calendarSummaryResource.reload();
            this.visibleRangeSummaryResource.reload();
          },
          error: (error) => {
            console.error('Error copying/moving items:', error);
            this.toastService.showError(
              `Failed to ${result.action} items to journey. Please try again.`,
            );
          },
        });
      }
    });
  }

  // New methods for enhanced UI
  getSelectedDayLabel(): string {
    const selected = this.selectedDay();
    const journey = this.journey();
    
    if (selected instanceof Date) {
      return selected.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    } else if (journey && !journey.startDate) {
      return `Day ${selected}`;
    }
    
    return '';
  }

  isMobileViewport(): boolean {
    return window.innerWidth < 1024; // lg breakpoint
  }

  onCalendarExpandedChange(expanded: boolean): void {
    // Optional: Add any logic needed when calendar is expanded/collapsed
    console.log('Calendar expanded:', expanded);
  }

  hasScrolledTop(): boolean {
    return this.scrolledTop();
  }

  hasScrolledBottom(): boolean {
    return this.scrolledBottom();
  }

  onActivitiesScroll(event: Event): void {
    const element = event.target as HTMLElement;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;
    
    // Check if scrolled from top
    this.scrolledTop.set(scrollTop > 10);
    
    // Check if scrolled to bottom (with 10px threshold)
    this.scrolledBottom.set(scrollTop + clientHeight < scrollHeight - 10);
  }

  onAddActivityBetween(context: any): void {
    // Context can contain information about where to insert the activity
    // For now, just open the add activity modal
    this.openAddActivityModal();
  }
}
