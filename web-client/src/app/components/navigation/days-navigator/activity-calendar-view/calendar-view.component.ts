import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { JourneyActivity } from '../../../../models/activities.model';
import { UserFirstDayOfWeek } from '../../../../models/enums/user-preferences.enum';
import { Journey } from '../../../../models/journeys.model';

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
  monthChange = output<Date>();

  // Use a signal for manual month navigation
  manualMonth = signal<Date | null>(null);

  // Compute current month based on manual navigation or selected day
  currentMonth = computed(() => {
    const manual = this.manualMonth();
    if (manual) {
      return manual;
    }

    const selected = this.selectedDay();
    const j = this.journey();

    if (selected instanceof Date) {
      return new Date(selected.getFullYear(), selected.getMonth(), 1);
    } else if (j?.startDate) {
      const startDate = new Date(j.startDate);
      return new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    } else {
      const today = new Date();
      return new Date(today.getFullYear(), today.getMonth(), 1);
    }
  });

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
    const current = this.currentMonth();
    const newMonth = new Date(current);
    newMonth.setMonth(newMonth.getMonth() - 1);
    this.manualMonth.set(newMonth);
    this.monthChange.emit(newMonth);
  }

  onNextMonth(): void {
    const current = this.currentMonth();
    const newMonth = new Date(current);
    newMonth.setMonth(newMonth.getMonth() + 1);
    this.manualMonth.set(newMonth);
    this.monthChange.emit(newMonth);
  }

  onDayClick(day: CalendarDay): void {
    // Clear manual month when a day is selected so the calendar follows the selected day again
    this.manualMonth.set(null);
    this.dayChange.emit(day.date);
  }

  goToToday(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Clear manual month to follow the selected day
    this.manualMonth.set(null);
    this.dayChange.emit(today);
  }

  clearManualMonth(): void {
    this.manualMonth.set(null);
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
