import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { UserFirstDayOfWeek } from '../../../../models/enums/user-preferences.enum';
import { Journey } from '../../../../models/journeys.model';
import { JourneyActivity } from '../../../activities/day-activities-list/day-activities-list.component';

export interface PaginationDay {
  date?: Date;
  dayIndex?: number;
  label: string;
  hasActivities: boolean;
  isInJourneyRange: boolean;
  isSelected: boolean;
  isToday: boolean;
  isWeekend: boolean;
  isJourneyStartDate: boolean;
  isJourneyEndDate: boolean;
}

@Component({
  selector: 'ts-pagination-view',
  imports: [FontAwesomeModule, NgClass],
  templateUrl: './pagination-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationViewComponent {
  journey = input<Journey | null>(null);
  selectedDay = input<Date | number>(1);
  activities = input<JourneyActivity[]>([]);
  firstDayOfWeek = input<UserFirstDayOfWeek>(UserFirstDayOfWeek.Monday);

  dayChange = output<Date | number>();

  currentPageStartIndex = signal(0);
  itemsPerPage = 7;

  hasJourneyDates = computed(() => {
    const j = this.journey();
    return !!j?.startDate;
  });

  allDays = computed(() => {
    const days: PaginationDay[] = [];
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

      displayStartDate.setDate(displayStartDate.getDate() - 30);

      const displayEndDate = endDate ? new Date(endDate) : new Date(startDate);
      displayEndDate.setDate(displayEndDate.getDate() + 90);

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
      // Journey without specific dates - use day indices
      const totalDays = 365;
      for (let i = 1; i <= totalDays; i++) {
        days.push({
          dayIndex: i,
          label: this.getDayIndexLabel(i),
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
    const start = this.currentPageStartIndex();
    return days.slice(start, start + this.itemsPerPage);
  });

  currentPageEndIndex = computed(() => {
    const start = this.currentPageStartIndex();
    const total = this.allDays().length;
    return Math.min(start + this.itemsPerPage, total);
  });

  canGoToPrevious = computed(() => {
    return this.currentPageStartIndex() > 0;
  });

  canGoToNext = computed(() => {
    const start = this.currentPageStartIndex();
    const total = this.allDays().length;
    return start + this.itemsPerPage < total;
  });

  onDayClick(day: PaginationDay): void {
    const value = day.date || day.dayIndex!;
    this.dayChange.emit(value);
  }

  onPreviousPage(): void {
    this.currentPageStartIndex.update((current) => Math.max(0, current - this.itemsPerPage));
  }

  onNextPage(): void {
    const total = this.allDays().length;
    this.currentPageStartIndex.update((current) => {
      const newStart = current + this.itemsPerPage;
      return newStart < total ? newStart : current;
    });
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
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    return `${day} ${month}`;
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
}
