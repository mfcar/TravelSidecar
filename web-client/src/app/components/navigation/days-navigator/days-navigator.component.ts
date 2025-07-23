import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal, viewChild } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { JourneyActivity } from '../../../models/activities.model';
import { UserFirstDayOfWeek } from '../../../models/enums/user-preferences.enum';
import { Journey } from '../../../models/journeys.model';
import { ActivityCalendarViewComponent } from './activity-calendar-view/calendar-view.component';
import { ActivityPaginationViewComponent } from './activity-pagination-view/pagination-view.component';

export enum DayNavigatorMode {
  Pagination = 'pagination',
  Calendar = 'calendar',
}

export interface DayInfo {
  date?: Date;
  dayIndex?: number;
  label: string;
  hasActivities: boolean;
  isInJourneyRange: boolean;
  isSelected: boolean;
  isCurrentMonth?: boolean;
  isToday?: boolean;
}

@Component({
  selector: 'ts-days-navigator',
  imports: [
    FontAwesomeModule,
    NgClass,
    ActivityCalendarViewComponent,
    ActivityPaginationViewComponent,
  ],
  templateUrl: './days-navigator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DaysNavigatorComponent {
  journey = input<Journey | null>(null);
  selectedDay = input<Date | number>(1);
  viewMode = input<DayNavigatorMode>(DayNavigatorMode.Pagination);
  activities = input<JourneyActivity[]>([]);
  activitySummary = input<Map<string, number>>(new Map());
  firstDayOfWeek = input<UserFirstDayOfWeek>(UserFirstDayOfWeek.Monday);

  calendarView = viewChild<ActivityCalendarViewComponent>('calendarView');

  dayChange = output<Date | number>();
  viewModeChange = output<DayNavigatorMode>();
  pageChange = output<number>(); // Emits when pagination page changes
  monthChange = output<Date>(); // Emits when calendar month changes

  currentPageStartIndex = signal(0);
  currentCalendarMonth = signal(new Date());
  itemsPerPage = 7;

  hasJourneyDates = computed(() => {
    const j = this.journey();
    return j?.startDate;
  });

  hasJourneyStartDate = computed(() => {
    const j = this.journey();
    return !!j?.startDate;
  });

  hasJourneyEndDate = computed(() => {
    const j = this.journey();
    return !!j?.endDate;
  });

  totalDays = computed(() => {
    const j = this.journey();
    if (j?.startDate && j?.endDate) {
      const start = new Date(j.startDate);
      const end = new Date(j.endDate);
      return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    } else if (j?.startDate) {
      return 365;
    }
    return 30;
  });

  allDays = computed(() => {
    const days: DayInfo[] = [];
    const j = this.journey();
    const activities = this.activities();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (this.hasJourneyDates()) {
      const startDate = new Date(j!.startDate!);
      const endDate = j?.endDate ? new Date(j.endDate) : null;

      const firstActivityDate = this.getFirstActivityDate(activities);
      const displayStartDate = new Date(startDate);

      if (firstActivityDate && firstActivityDate < startDate) {
        displayStartDate.setTime(firstActivityDate.getTime());
      }

      displayStartDate.setDate(displayStartDate.getDate() - 7);

      const displayEndDate = endDate ? new Date(endDate) : new Date(startDate);
      displayEndDate.setDate(displayEndDate.getDate() + 30);

      const totalDisplayDays =
        Math.ceil((displayEndDate.getTime() - displayStartDate.getTime()) / (1000 * 60 * 60 * 24)) +
        1;

      for (let i = 0; i < totalDisplayDays; i++) {
        const currentDate = new Date(displayStartDate);
        currentDate.setDate(displayStartDate.getDate() + i);

        const isInJourneyRange = endDate
          ? currentDate >= startDate && currentDate <= endDate
          : currentDate >= startDate;

        days.push({
          date: currentDate,
          label: this.formatDateLabel(currentDate),
          hasActivities: this.checkHasActivities(currentDate),
          isInJourneyRange,
          isSelected: this.isDateSelected(currentDate),
          isToday: currentDate.getTime() === today.getTime(),
        });
      }
    } else {
      const total = this.totalDays();
      for (let i = 1; i <= total; i++) {
        days.push({
          dayIndex: i,
          label: this.getDayIndexLabel(i),
          hasActivities: this.checkHasActivitiesForDay(),
          isInJourneyRange: true,
          isSelected: this.selectedDay() === i,
          isToday: false,
        });
      }
    }

    return days;
  });

  visibleDays = computed(() => {
    const days = this.allDays();
    if (this.viewMode() === DayNavigatorMode.Calendar) {
      return this.getCalendarDays(days);
    }

    const start = this.currentPageStartIndex();
    return days.slice(start, start + this.itemsPerPage);
  });

  private getCalendarDays(allDays: DayInfo[]): DayInfo[] {
    const currentMonth = this.currentCalendarMonth();
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    if (this.hasJourneyDates()) {
      return allDays
        .filter((day) => {
          if (!day.date) return false;
          const dayDate = new Date(day.date);
          return dayDate >= monthStart && dayDate <= monthEnd;
        })
        .map((day) => ({
          ...day,
          isCurrentMonth: true,
        }));
    }

    return allDays;
  }

  currentMonthLabel = computed(() => {
    const month = this.currentCalendarMonth();
    return month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });

  canGoToPrevious = computed(() => {
    return true;
  });

  canGoToNext = computed(() => {
    return true;
  });

  currentPageEndIndex = computed(() => {
    const start = this.currentPageStartIndex();
    const total = this.allDays().length;
    return Math.min(start + this.itemsPerPage, total);
  });

  // Get the visible date range for the current view
  getVisibleDateRange(): { startDate: Date; endDate: Date } | null {
    const viewMode = this.viewMode();
    const journey = this.journey();

    if (viewMode === DayNavigatorMode.Calendar) {
      // Calendar view: get first and last day of the current month
      const month = this.currentCalendarMonth();
      const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
      const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      return { startDate, endDate };
    } else {
      // Pagination view: get the range of visible days
      const visibleDays = this.visibleDays();
      if (visibleDays.length === 0) return null;

      // For dated journeys
      if (journey?.startDate && visibleDays[0]?.date) {
        const startDate = new Date(visibleDays[0].date);
        const lastDay = visibleDays[visibleDays.length - 1];
        const endDate = lastDay?.date ? new Date(lastDay.date) : new Date(startDate);
        return { startDate, endDate };
      }

      // For undated journeys, we can't determine a date range
      return null;
    }
  }

  onDayClick(day: DayInfo): void {
    const value = day.date || day.dayIndex!;
    this.dayChange.emit(value);
  }

  onPreviousPage(): void {
    if (this.viewMode() === DayNavigatorMode.Calendar) {
      this.onPreviousMonth();
    } else {
      const currentStart = this.currentPageStartIndex();
      if (currentStart > 0) {
        this.currentPageStartIndex.update((current) => Math.max(0, current - this.itemsPerPage));
        this.pageChange.emit(this.currentPageStartIndex());
      } else {
        console.log('At beginning of pagination - could extend range');
      }
    }
  }

  onNextPage(): void {
    if (this.viewMode() === DayNavigatorMode.Calendar) {
      this.onNextMonth();
    } else {
      const start = this.currentPageStartIndex();
      const total = this.allDays().length;
      if (start + this.itemsPerPage < total) {
        this.currentPageStartIndex.update((current) => current + this.itemsPerPage);
        this.pageChange.emit(this.currentPageStartIndex());
      } else {
        console.log('At end of pagination - could extend range');
      }
    }
  }

  onPreviousMonth(): void {
    this.currentCalendarMonth.update((current) => {
      const newMonth = new Date(current);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
    this.monthChange.emit(this.currentCalendarMonth());
  }

  onNextMonth(): void {
    this.currentCalendarMonth.update((current) => {
      const newMonth = new Date(current);
      newMonth.setMonth(newMonth.getMonth() + 1);
      return newMonth;
    });
    this.monthChange.emit(this.currentCalendarMonth());
  }

  onToggleViewMode(mode: DayNavigatorMode): void {
    if (mode !== this.viewMode()) {
      this.viewModeChange.emit(mode);
    }
  }

  onCalendarDayChange(date: Date): void {
    this.dayChange.emit(date);
  }

  onCalendarMonthChange(month: Date): void {
    this.currentCalendarMonth.set(month);
    this.monthChange.emit(month);
  }

  onPaginationDayChange(value: Date | number): void {
    this.dayChange.emit(value);
  }

  goToToday(): void {
    if (this.hasJourneyDates()) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      // Clear manual month in calendar view if it's active
      const calendar = this.calendarView();
      if (calendar) {
        calendar.clearManualMonth();
      }
      this.dayChange.emit(today);
    }
  }

  goToJourneyStart(): void {
    const j = this.journey();
    if (j?.startDate) {
      // Clear manual month in calendar view if it's active
      const calendar = this.calendarView();
      if (calendar) {
        calendar.clearManualMonth();
      }
      this.dayChange.emit(new Date(j.startDate));
    } else {
      this.dayChange.emit(1);
    }
  }

  goToJourneyEnd(): void {
    const j = this.journey();
    if (j?.endDate) {
      // Clear manual month in calendar view if it's active
      const calendar = this.calendarView();
      if (calendar) {
        calendar.clearManualMonth();
      }
      this.dayChange.emit(new Date(j.endDate));
    } else {
      this.dayChange.emit(this.totalDays());
    }
  }

  private formatDateLabel(date: Date): string {
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    return `${day} ${month}`;
  }

  private getDayIndexLabel(dayIndex: number): string {
    const suffixes = ['st', 'nd', 'rd'];
    const suffix = suffixes[dayIndex - 1] || 'th';
    return `${dayIndex}${suffix} Day`;
  }

  private isDateSelected(date: Date): boolean {
    const selected = this.selectedDay();
    if (selected instanceof Date) {
      return date.getTime() === selected.getTime();
    }
    return false;
  }

  private checkHasActivities(date: Date): boolean {
    const summary = this.activitySummary();
    const dateStr = this.formatDateKey(date);
    const count = summary.get(dateStr);
    return (count ?? 0) > 0;
  }

  private formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private checkHasActivitiesForDay(/* dayIndex: number, activities: JourneyActivity[] */): boolean {
    return false;
  }

  private getFirstActivityDate(activities: JourneyActivity[]): Date | null {
    if (activities.length === 0) return null;

    const datedActivities = activities
      .filter((a) => a.startDateTime)
      .map((a) => new Date(a.startDateTime!))
      .sort((a, b) => a.getTime() - b.getTime());

    return datedActivities[0] || null;
  }

  readonly DayNavigatorMode = DayNavigatorMode;
}
