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

export interface ActivityPaginationDay {
  date?: Date;
  dayIndex?: number;
  label: string;
  weekdayLabel: string;
  hasActivities: boolean;
  isInJourneyRange: boolean;
  isSelected: boolean;
  isToday: boolean;
  isWeekend: boolean;
  isJourneyStartDate: boolean;
  isJourneyEndDate: boolean;
}

@Component({
  selector: 'ts-activity-pagination-view',
  imports: [FontAwesomeModule, NgClass],
  templateUrl: './pagination-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityPaginationViewComponent {
  journey = input<Journey | null>(null);
  selectedDay = input<Date | number>(1);
  activities = input<JourneyActivity[]>([]);
  firstDayOfWeek = input<UserFirstDayOfWeek>(UserFirstDayOfWeek.Monday);

  dayChange = output<Date | number>();

  currentPageStartIndex = signal(0);
  itemsPerPage = 7;

  constructor() {
    effect(() => {
      const selected = this.selectedDay();
      const days = this.allDays();

      if (selected) {
        let targetIndex = -1;

        if (selected instanceof Date) {
          targetIndex = days.findIndex((day) => day.date && this.isSameDay(day.date, selected));
        } else if (typeof selected === 'number') {
          targetIndex = days.findIndex((day) => day.dayIndex === selected);
        }

        if (targetIndex >= 0) {
          const pageStart = Math.floor(targetIndex / this.itemsPerPage) * this.itemsPerPage;
          this.currentPageStartIndex.set(pageStart);
        }
      }
    });
  }

  hasJourneyDates = computed(() => {
    const j = this.journey();
    return !!j?.startDate;
  });

  weekDays = computed(() => {
    const firstDayOfWeek = this.firstDayOfWeek();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const orderedDays = [...dayNames.slice(firstDayOfWeek), ...dayNames.slice(0, firstDayOfWeek)];
    return orderedDays;
  });

  allDays = computed(() => {
    const days: ActivityPaginationDay[] = [];
    const j = this.journey();
    const activities = this.activities();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (this.hasJourneyDates()) {
      const startDate = new Date(j!.startDate!);
      const endDate = j?.endDate ? new Date(j.endDate) : null;

      const firstActivityDate = this.getFirstActivityDate(activities);
      const lastActivityDate = this.getLastActivityDate(activities);

      const earliestDate = new Date(
        Math.min(
          startDate.getTime(),
          firstActivityDate?.getTime() || startDate.getTime(),
          today.getTime(),
        ),
      );
      earliestDate.setDate(earliestDate.getDate() - 365);

      const latestDate = new Date(
        Math.max(
          endDate?.getTime() || startDate.getTime(),
          lastActivityDate?.getTime() || startDate.getTime(),
          today.getTime(),
        ),
      );
      latestDate.setDate(latestDate.getDate() + 365);

      const totalPossibleDays = Math.ceil(
        (latestDate.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      for (let i = 0; i < totalPossibleDays; i++) {
        const currentDate = new Date(earliestDate);
        currentDate.setDate(earliestDate.getDate() + i);

        const isInJourneyRange = endDate
          ? currentDate >= startDate && currentDate <= endDate
          : currentDate >= startDate;

        days.push({
          date: currentDate,
          label: this.formatDateLabel(currentDate),
          weekdayLabel: this.formatWeekdayLabel(currentDate),
          hasActivities: this.checkHasActivities(currentDate, activities),
          isInJourneyRange,
          isSelected: this.isDateSelected(currentDate),
          isToday: this.isSameDay(currentDate, today),
          isWeekend: this.isWeekendDay(currentDate),
          isJourneyStartDate: this.isJourneyStartDate(currentDate),
          isJourneyEndDate: this.isJourneyEndDate(currentDate),
        });
      }
    } else {
      const totalDays = 1000;
      for (let i = 1; i <= totalDays; i++) {
        days.push({
          dayIndex: i,
          label: this.getDayIndexLabel(i),
          weekdayLabel: '',
          hasActivities: false,
          isInJourneyRange: true,
          isSelected: this.isDayIndexSelected(i),
          isToday: false,
          isWeekend: false,
          isJourneyStartDate: i === 1,
          isJourneyEndDate: false,
        });
      }
    }

    return days;
  });

  visibleDays = computed(() => {
    const days = this.allDays();
    if (days.length === 0) return [];

    const selectedDay = this.selectedDay();
    let targetIndex = -1;

    if (selectedDay instanceof Date) {
      targetIndex = days.findIndex((day) => day.date && this.isSameDay(day.date, selectedDay));
    } else if (typeof selectedDay === 'number') {
      targetIndex = days.findIndex((day) => day.dayIndex === selectedDay);
    }

    if (targetIndex === -1) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Try to find today first
      targetIndex = days.findIndex((day) => day.date && this.isSameDay(day.date, today));

      // If today not found, try journey start
      if (targetIndex === -1) {
        targetIndex = days.findIndex((day) => day.isJourneyStartDate);
      }

      // If still not found, try first activity
      if (targetIndex === -1) {
        targetIndex = days.findIndex((day) => day.hasActivities);
      }

      // Default to middle of available days
      if (targetIndex === -1) {
        targetIndex = Math.floor(days.length / 2);
      }
    }

    if (targetIndex >= 0 && targetIndex < days.length) {
      const targetDay = days[targetIndex];

      if (targetDay.date) {
        const targetDate = targetDay.date;
        const dayOfWeek = targetDate.getDay();
        const firstDayOfWeek = this.firstDayOfWeek();

        const daysBack = (dayOfWeek - firstDayOfWeek + 7) % 7;

        const weekStartDate = new Date(targetDate);
        weekStartDate.setDate(targetDate.getDate() - daysBack);

        const weekStartIndex = days.findIndex(
          (day) => day.date && this.isSameDay(day.date, weekStartDate),
        );

        if (weekStartIndex >= 0) {
          return days.slice(weekStartIndex, weekStartIndex + 7);
        }
      }

      const start = Math.max(0, targetIndex - 3);
      return days.slice(start, start + 7);
    }

    return days.slice(0, 7);
  });

  currentPageEndIndex = computed(() => {
    const start = this.currentPageStartIndex();
    const total = this.allDays().length;
    return Math.min(start + this.itemsPerPage, total);
  });

  selectedDayLabel = computed(() => {
    const visible = this.visibleDays();
    if (visible.length === 0) return 'No days available';

    const firstDay = visible[0];
    const lastDay = visible[visible.length - 1];

    if (firstDay.date && lastDay.date) {
      const firstDate = firstDay.date;
      const lastDate = lastDay.date;

      if (
        firstDate.getMonth() === lastDate.getMonth() &&
        firstDate.getFullYear() === lastDate.getFullYear()
      ) {
        return `${firstDate.toLocaleDateString('en-US', { month: 'long' })} ${firstDate.getDate()} - ${lastDate.getDate()}, ${firstDate.getFullYear()}`;
      } else if (firstDate.getFullYear() === lastDate.getFullYear()) {
        return `${firstDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${lastDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}, ${firstDate.getFullYear()}`;
      } else {
        return `${firstDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${lastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      }
    } else if (firstDay.dayIndex && lastDay.dayIndex) {
      return `Days ${firstDay.dayIndex} - ${lastDay.dayIndex}`;
    }

    return 'Week view';
  });

  canGoToPrevious = computed(() => {
    if (this.hasJourneyDates()) {
      return true;
    } else {
      return this.currentPageStartIndex() > 0;
    }
  });

  canGoToNext = computed(() => {
    return true;
  });

  onDayClick(day: ActivityPaginationDay): void {
    const value = day.date || day.dayIndex!;
    this.dayChange.emit(value);
  }

  onPreviousPage(): void {
    const visible = this.visibleDays();
    if (visible.length === 0) return;

    const firstVisibleDay = visible[0];

    if (firstVisibleDay.date) {
      const previousWeekDate = new Date(firstVisibleDay.date);
      previousWeekDate.setDate(firstVisibleDay.date.getDate() - 7);

      const dayOfWeek = previousWeekDate.getDay();
      const firstDayOfWeek = this.firstDayOfWeek();
      const daysBack = (dayOfWeek - firstDayOfWeek + 7) % 7;

      const weekStartDate = new Date(previousWeekDate);
      weekStartDate.setDate(previousWeekDate.getDate() - daysBack);

      this.dayChange.emit(weekStartDate);
    } else if (firstVisibleDay.dayIndex) {
      const newDayIndex = Math.max(1, firstVisibleDay.dayIndex - 7);
      this.dayChange.emit(newDayIndex);
    }
  }

  onNextPage(): void {
    const visible = this.visibleDays();
    if (visible.length === 0) return;

    const firstVisibleDay = visible[0];

    if (firstVisibleDay.date) {
      const nextWeekDate = new Date(firstVisibleDay.date);
      nextWeekDate.setDate(firstVisibleDay.date.getDate() + 7);
      this.dayChange.emit(nextWeekDate);
    } else if (firstVisibleDay.dayIndex) {
      const newDayIndex = firstVisibleDay.dayIndex + 7;
      this.dayChange.emit(newDayIndex);
    }
  }

  goToToday(): void {
    if (this.hasJourneyDates()) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      this.dayChange.emit(today);

      const todayIndex = this.allDays().findIndex(
        (day) => day.date && this.isSameDay(day.date, today),
      );
      if (todayIndex >= 0) {
        const pageStart = Math.floor(todayIndex / this.itemsPerPage) * this.itemsPerPage;
        this.currentPageStartIndex.set(pageStart);
      }
    }
  }

  goToJourneyStart(): void {
    const j = this.journey();
    if (j?.startDate) {
      this.dayChange.emit(new Date(j.startDate));
      const startIndex = this.allDays().findIndex((day) => day.isJourneyStartDate);
      if (startIndex >= 0) {
        const pageStart = Math.floor(startIndex / this.itemsPerPage) * this.itemsPerPage;
        this.currentPageStartIndex.set(pageStart);
      }
    } else {
      this.dayChange.emit(1);
      this.currentPageStartIndex.set(0);
    }
  }

  goToJourneyEnd(): void {
    const j = this.journey();
    if (j?.endDate) {
      this.dayChange.emit(new Date(j.endDate));
      const endIndex = this.allDays().findIndex((day) => day.isJourneyEndDate);
      if (endIndex >= 0) {
        const pageStart = Math.floor(endIndex / this.itemsPerPage) * this.itemsPerPage;
        this.currentPageStartIndex.set(pageStart);
      }
    } else {
      const totalDays = this.allDays().length;
      this.dayChange.emit(totalDays);
      const lastPageStart = Math.floor((totalDays - 1) / this.itemsPerPage) * this.itemsPerPage;
      this.currentPageStartIndex.set(lastPageStart);
    }
  }

  private formatDateLabel(date: Date): string {
    const day = date.getDate();
    return `${day}`;
  }

  private formatWeekdayLabel(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }

  private getDayIndexLabel(dayIndex: number): string {
    const suffix = this.getOrdinalSuffix(dayIndex);
    return `${dayIndex}${suffix}`;
  }

  private getOrdinalSuffix(num: number): string {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
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

  private isDayIndexSelected(dayIndex: number): boolean {
    const selected = this.selectedDay();
    return typeof selected === 'number' && selected === dayIndex;
  }

  private isWeekendDay(date: Date): boolean {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
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

  private checkHasActivities(date: Date, activities: JourneyActivity[]): boolean {
    return activities.some((activity) => {
      if (!activity.startDateTime) return false;

      const activityDate = new Date(activity.startDateTime);
      activityDate.setHours(0, 0, 0, 0);

      return this.isSameDay(date, activityDate);
    });
  }

  private getFirstActivityDate(activities: JourneyActivity[]): Date | null {
    if (activities.length === 0) return null;

    const datedActivities = activities
      .filter((a) => a.startDateTime)
      .map((a) => new Date(a.startDateTime!))
      .sort((a, b) => a.getTime() - b.getTime());

    return datedActivities[0] || null;
  }

  private getLastActivityDate(activities: JourneyActivity[]): Date | null {
    if (activities.length === 0) return null;

    const datedActivities = activities
      .filter((a) => a.startDateTime)
      .map((a) => new Date(a.startDateTime!))
      .sort((a, b) => b.getTime() - a.getTime());

    return datedActivities[0] || null;
  }
}
