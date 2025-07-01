import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { of } from 'rxjs';
import {
  ActivitiesViewMode,
  ActivitiesViewToggleComponent,
} from '../../../components/activities/activities-view-toggle/activities-view-toggle.component';
import {
  DayActivitiesListComponent,
  JourneyActivity,
} from '../../../components/activities/day-activities-list/day-activities-list.component';
import {
  DayNavigatorMode,
  DaysNavigatorComponent,
} from '../../../components/navigation/days-navigator/days-navigator.component';
import { UserFirstDayOfWeek } from '../../../models/enums/user-preferences.enum';
import { JourneyActivityService } from '../../../services/journey-activity.service';
import { JourneyService } from '../../../services/journey.service';
import { UserPreferencesService } from '../../../services/user-preferences.service';

@Component({
  selector: 'ts-journey-activities',
  imports: [
    FontAwesomeModule,
    DaysNavigatorComponent,
    ActivitiesViewToggleComponent,
    DayActivitiesListComponent,
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

  allActivities = signal<JourneyActivity[]>([]);
  isLoadingActivities = signal<boolean>(false);

  activitiesResource = rxResource({
    request: () => ({ journeyId: this.journeyId(), journey: this.journey() }),
    loader: ({ request }) => {
      if (!request.journeyId) {
        return of([]);
      }
      return this.journeyActivityService.getJourneyActivities(request.journeyId, request.journey);
    },
  });

  dayActivitiesResource = rxResource({
    request: () => ({
      journeyId: this.journeyId(),
      day: this.selectedDay(),
      journey: this.journey(),
    }),
    loader: ({ request }) => {
      if (!request.journeyId) {
        return of([]);
      }
      return this.journeyActivityService.getActivitiesForDay(
        request.journeyId,
        request.day,
        request.journey,
      );
    },
  });

  currentDayActivities = computed(() => {
    return this.dayActivitiesResource.value() || [];
  });

  constructor() {
    this.loadUserPreferences();

    effect(() => {
      const journey = this.journey();
      if (journey) {
        this.setInitialSelectedDay();
      }
    });

    effect(() => {
      const activities = this.activitiesResource.value();
      if (activities && Array.isArray(activities)) {
        this.allActivities.set(activities);
      }
    });

    effect(() => {
      this.isLoadingActivities.set(this.dayActivitiesResource.isLoading());
    });
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
  }

  onActivitiesViewModeChange(mode: ActivitiesViewMode): void {
    this.activitiesViewMode.set(mode);
    localStorage.setItem('journey_activitiesViewMode', mode);
    console.log('Activities view mode changed to:', mode);
  }

  onEditActivity(activity: JourneyActivity): void {
    console.log('Edit activity:', activity);
  }

  onDeleteActivity(activityId: string): void {
    console.log('Delete activity:', activityId);
  }

  onReorderActivities(activities: JourneyActivity[]): void {
    console.log('Reorder activities:', activities);
  }
}
