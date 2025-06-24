import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { UserFirstDayOfWeek } from '../../../../models/enums/user-preferences.enum';
import { Journey } from '../../../../models/journeys.model';
import { JourneyActivity } from '../../../activities/day-activities-list/day-activities-list.component';

export interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isInJourneyRange: boolean;
  isJourneyStartDate: boolean;
  isJourneyEndDate: boolean;
  isWeekend: boolean;
  hasActivities: boolean;
}

@Component({
  selector: 'ts-activity-calendar-view',
  imports: [FontAwesomeModule, NgClass],
  templateUrl: './calendar-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityCalendarViewComponent {
  journey = input<Journey | null>(null);
  selectedDay = input<Date | number>(new Date());
  activities = input<JourneyActivity[]>([]);
  firstDayOfWeek = input<UserFirstDayOfWeek>(UserFirstDayOfWeek.Monday);

  dayChange = output<Date>();

  currentMonth = signal(new Date());

  constructor() {
    this.initializeCalendarMonth();

    effect(() => {
      const selected = this.selectedDay();
      if (selected instanceof Date) {
        const newMonth = new Date(selected.getFullYear(), selected.getMonth(), 1);
        this.currentMonth.set(newMonth);
      }
    });
  }

  hasJourneyDates = computed(() => {
    const j = this.journey();
    return !!j?.startDate;
  });

  currentMonthLabel = computed(() => {
    const month = this.currentMonth();
    return month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });

  weekDays = computed(() => {
    const firstDay = this.firstDayOfWeek();
    const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    const rotatedDays = [...dayLabels.slice(firstDay), ...dayLabels.slice(0, firstDay)];
    return rotatedDays;
  });

  calendarDays = computed(() => {
    const currentDate = this.currentMonth();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfWeekPref = this.firstDayOfWeek();

    const firstDay = new Date(year, month, 1);

    const firstCalendarDay = new Date(firstDay);

    const daysToSubtract = (firstDay.getDay() - firstDayOfWeekPref + 7) % 7;
    firstCalendarDay.setDate(firstCalendarDay.getDate() - daysToSubtract);

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentDay = new Date(firstCalendarDay);

    for (let i = 0; i < 42; i++) {
      const dayDate = new Date(currentDay);
      dayDate.setHours(0, 0, 0, 0);

      days.push({
        date: dayDate,
        dayNumber: currentDay.getDate(),
        isCurrentMonth: currentDay.getMonth() === month,
        isToday: this.isSameDay(currentDay, today),
        isSelected: this.isDateSelected(currentDay),
        isInJourneyRange: this.isDateInJourneyRangeVisual(currentDay),
        isJourneyStartDate: this.isJourneyStartDate(currentDay),
        isJourneyEndDate: this.isJourneyEndDate(currentDay),
        isWeekend: this.isWeekendDay(currentDay),
        hasActivities: this.checkHasActivities(currentDay),
      });

      currentDay.setDate(currentDay.getDate() + 1);
    }

    return days;
  });

  onPreviousMonth(): void {
    this.currentMonth.update((current) => {
      const newMonth = new Date(current);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  }

  onNextMonth(): void {
    this.currentMonth.update((current) => {
      const newMonth = new Date(current);
      newMonth.setMonth(newMonth.getMonth() + 1);
      return newMonth;
    });
  }

  onDayClick(day: CalendarDay): void {
    this.dayChange.emit(day.date);
  }

  goToToday(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.currentMonth.set(new Date(today.getFullYear(), today.getMonth(), 1));
    this.dayChange.emit(today);
  }

  private initializeCalendarMonth(): void {
    const selected = this.selectedDay();
    const j = this.journey();

    if (selected instanceof Date) {
      this.currentMonth.set(new Date(selected.getFullYear(), selected.getMonth(), 1));
    } else if (j?.startDate) {
      const startDate = new Date(j.startDate);
      this.currentMonth.set(new Date(startDate.getFullYear(), startDate.getMonth(), 1));
    } else {
      const today = new Date();
      this.currentMonth.set(new Date(today.getFullYear(), today.getMonth(), 1));
    }
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  private isDateSelected(date: Date): boolean {
    const selected = this.selectedDay();
    if (selected instanceof Date) {
      return this.isSameDay(date, selected);
    }
    return false;
  }

  private isDateInJourneyRangeVisual(date: Date): boolean {
    const j = this.journey();
    if (!j?.startDate) return false;

    const startDate = new Date(j.startDate);
    startDate.setHours(0, 0, 0, 0);

    if (j.endDate) {
      const endDate = new Date(j.endDate);
      endDate.setHours(0, 0, 0, 0);
      return date >= startDate && date <= endDate;
    }

    return date >= startDate;
  }

  private isJourneyStartDate(date: Date): boolean {
    const j = this.journey();
    if (!j?.startDate) return false;

    const startDate = new Date(j.startDate);
    startDate.setHours(0, 0, 0, 0);

    return this.isSameDay(date, startDate);
  }

  private isJourneyEndDate(date: Date): boolean {
    const j = this.journey();
    if (!j?.endDate) return false;

    const endDate = new Date(j.endDate);
    endDate.setHours(0, 0, 0, 0);

    return this.isSameDay(date, endDate);
  }

  private isWeekendDay(date: Date): boolean {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  }

  private checkHasActivities(date: Date): boolean {
    const activities = this.activities();
    return activities.some((activity) => {
      if (!activity.startDateTime) return false;

      const activityDate = new Date(activity.startDateTime);
      activityDate.setHours(0, 0, 0, 0);

      return this.isSameDay(date, activityDate);
    });
  }
}
