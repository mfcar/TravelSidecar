import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
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

  currentDayActivities = signal<JourneyActivity[]>([]);
  allActivities = signal<JourneyActivity[]>([]);
  isLoadingActivities = signal<boolean>(false);

  constructor() {
    this.loadUserPreferences();

    this.setInitialSelectedDay();

    this.loadMockActivities();
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

  private loadMockActivities(): void {
    const j = this.journey();
    if (!j?.startDate) return;

    const mockActivities: JourneyActivity[] = [
      {
        id: '1',
        name: 'Get Thailand Visa',
        description: 'Apply for Thailand visa at embassy',
        startDateTime: new Date('2025-11-20T10:00:00'),
        location: 'Thai Embassy',
        createdAt: new Date(),
        lastModifiedAt: new Date(),
      },
      {
        id: '2',
        name: 'Flight to Bangkok',
        description: 'Arrive in Bangkok',
        startDateTime: new Date(j.startDate),
        endDateTime: new Date(new Date(j.startDate).getTime() + 4 * 60 * 60 * 1000),
        location: 'Suvarnabhumi Airport',
        createdAt: new Date(),
        lastModifiedAt: new Date(),
      },
      {
        id: '3',
        name: 'Temple Visit',
        description: 'Visit Wat Pho Temple',
        startDateTime: new Date(new Date(j.startDate).getTime() + 24 * 60 * 60 * 1000),
        location: 'Wat Pho Temple',
        cost: 100,
        currencyCode: 'THB',
        createdAt: new Date(),
        lastModifiedAt: new Date(),
      },
    ];

    this.allActivities.set(mockActivities);
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
