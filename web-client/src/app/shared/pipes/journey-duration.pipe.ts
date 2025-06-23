import { Pipe, PipeTransform } from '@angular/core';

export interface JourneyDurationInfo {
  text: string;
  totalDays: number;
  hasCompleteDuration: boolean;
}

@Pipe({
  name: 'journeyDuration',
  standalone: true,
})
export class JourneyDurationPipe implements PipeTransform {
  transform(startDate?: Date | null, endDate?: Date | null): JourneyDurationInfo | null {
    if (!startDate || !endDate) {
      return null;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (totalDays < 1) {
      return null;
    }

    const daysText = totalDays === 1 ? 'day' : 'days';

    return {
      text: `${totalDays} ${daysText} trip`,
      totalDays: totalDays,
      hasCompleteDuration: true,
    };
  }
}
