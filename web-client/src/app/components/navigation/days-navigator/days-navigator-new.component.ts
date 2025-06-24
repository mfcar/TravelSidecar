import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Journey } from '../../../models/journeys.model';

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
}

@Component({
  selector: 'ts-days-navigator',
  imports: [FontAwesomeModule, NgClass],
  templateUrl: './days-navigator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DaysNavigatorComponent {
  journey = input<Journey | null>(null);
  selectedDay = input<Date | number>(1);
  viewMode = input<DayNavigatorMode>(DayNavigatorMode.Pagination);

  dayChange = output<Date | number>();
  viewModeChange = output<DayNavigatorMode>();

  currentMonthYear = signal(new Date());

  hasJourneyDates = computed(() => {
    const j = this.journey();
    return j?.startDate;
  });

  calendarDays = computed(() => {
    if (this.viewMode() !== DayNavigatorMode.Calendar) return [];

    const monthDate = this.currentMonthYear();
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();

    const firstDay = new Date(year, month, 1);

    const startCalendar = new Date(firstDay);
    const dayOfWeek = firstDay.getDay(); // 0 = Sunday
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Monday = 0
    startCalendar.setDate(firstDay.getDate() - mondayOffset);

    const days: DayInfo[] = [];
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startCalendar);
      currentDate.setDate(startCalendar.getDate() + i);

      const isCurrentMonth = currentDate.getMonth() === month;

      days.push({
        date: currentDate,
        label: this.formatDateLabel(currentDate),
        hasActivities: this.checkHasActivities(currentDate),
        isInJourneyRange: this.isDateInJourneyRange(currentDate),
        isSelected: this.isDateSelected(currentDate),
        isCurrentMonth,
      });
    }

    return days;
  });

  paginationDays = computed(() => {
    if (this.viewMode() !== DayNavigatorMode.Pagination) return [];

    const selectedDay = this.selectedDay();

    if (!this.hasJourneyDates()) {
      const days: DayInfo[] = [];
      const totalDays = 30;
      const selectedIndex = selectedDay as number;
      const startIndex = Math.max(1, selectedIndex - 3);

      for (let i = 0; i < 7 && startIndex + i <= totalDays; i++) {
        const dayIndex = startIndex + i;
        days.push({
          dayIndex,
          label: this.getDayIndexLabel(dayIndex),
          hasActivities: this.checkHasActivitiesForDay(dayIndex),
          isInJourneyRange: true,
          isSelected: selectedDay === dayIndex,
        });
      }
      return days;
    }

    const selectedDate = selectedDay instanceof Date ? selectedDay : new Date();
    const days: DayInfo[] = [];

    const startDate = new Date(selectedDate);
    startDate.setDate(selectedDate.getDate() - 3);

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      days.push({
        date: currentDate,
        label: this.formatDateLabel(currentDate),
        hasActivities: this.checkHasActivities(currentDate),
        isInJourneyRange: this.isDateInJourneyRange(currentDate),
        isSelected: this.isDateSelected(currentDate),
      });
    }

    return days;
  });

  visibleDays = computed(() => {
    return this.viewMode() === DayNavigatorMode.Calendar
      ? this.calendarDays()
      : this.paginationDays();
  });

  currentMonthLabel = computed(() => {
    const date = this.currentMonthYear();
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });

  onDayClick(day: DayInfo): void {
    const value = day.date || day.dayIndex!;
    this.dayChange.emit(value);
  }

  onPreviousPage(): void {
    if (this.viewMode() === DayNavigatorMode.Calendar) {
      this.goToPreviousMonth();
    } else {
      this.goToPreviousPaginationPage();
    }
  }

  onNextPage(): void {
    if (this.viewMode() === DayNavigatorMode.Calendar) {
      this.goToNextMonth();
    } else {
      this.goToNextPaginationPage();
    }
  }

  private goToPreviousMonth(): void {
    const current = this.currentMonthYear();
    const previous = new Date(current.getFullYear(), current.getMonth() - 1, 1);
    this.currentMonthYear.set(previous);
  }

  private goToNextMonth(): void {
    const current = this.currentMonthYear();
    const next = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    this.currentMonthYear.set(next);
  }

  private goToPreviousPaginationPage(): void {
    const selectedDay = this.selectedDay();

    if (!this.hasJourneyDates()) {
      const newIndex = Math.max(1, (selectedDay as number) - 7);
      this.dayChange.emit(newIndex);
    } else {
      const selectedDate = selectedDay instanceof Date ? selectedDay : new Date();
      const newDate = new Date(selectedDate);
      newDate.setDate(selectedDate.getDate() - 7);
      this.dayChange.emit(newDate);
    }
  }

  private goToNextPaginationPage(): void {
    const selectedDay = this.selectedDay();

    if (!this.hasJourneyDates()) {
      const newIndex = (selectedDay as number) + 7;
      this.dayChange.emit(Math.min(30, newIndex));
    } else {
      const selectedDate = selectedDay instanceof Date ? selectedDay : new Date();
      const newDate = new Date(selectedDate);
      newDate.setDate(selectedDate.getDate() + 7);
      this.dayChange.emit(newDate);
    }
  }

  onToggleViewMode(): void {
    const newMode =
      this.viewMode() === DayNavigatorMode.Pagination
        ? DayNavigatorMode.Calendar
        : DayNavigatorMode.Pagination;
    this.viewModeChange.emit(newMode);
  }

  goToToday(): void {
    this.dayChange.emit(new Date());
  }

  goToJourneyStart(): void {
    const j = this.journey();
    if (j?.startDate) {
      this.dayChange.emit(new Date(j.startDate));
    } else {
      this.dayChange.emit(1);
    }
  }

  goToJourneyEnd(): void {
    const j = this.journey();
    if (j?.endDate) {
      this.dayChange.emit(new Date(j.endDate));
    } else if (j?.startDate) {
      const endDate = new Date(j.startDate);
      endDate.setDate(endDate.getDate() + 30);
      this.dayChange.emit(endDate);
    } else {
      this.dayChange.emit(30);
    }
  }

  private isDateInJourneyRange(date: Date): boolean {
    const j = this.journey();
    if (!j?.startDate) return false;

    const journeyStart = new Date(j.startDate);
    if (j.endDate) {
      const journeyEnd = new Date(j.endDate);
      return date >= journeyStart && date <= journeyEnd;
    }

    return date >= journeyStart;
  }

  private isDateSelected(date: Date): boolean {
    const selected = this.selectedDay();
    if (!(selected instanceof Date)) return false;

    return date.toDateString() === selected.toDateString();
  }

  private formatDateLabel(date: Date): string {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  private getDayIndexLabel(index: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const remainder = index % 100;
    const suffix = suffixes[(remainder - 20) % 10] || suffixes[remainder] || suffixes[0];
    return `${index}${suffix} Day`;
  }

  private checkHasActivities(date: Date): boolean {
    console.log('Checking activities for date:', date);
    return false;
  }

  private checkHasActivitiesForDay(dayIndex: number): boolean {
    console.log('Checking activities for day:', dayIndex);
    return false;
  }

  canGoToPrevious = computed(() => true);
  canGoToNext = computed(() => true);

  readonly DayNavigatorMode = DayNavigatorMode;
}
