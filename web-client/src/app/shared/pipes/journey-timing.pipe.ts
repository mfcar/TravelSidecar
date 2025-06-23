import { Pipe, PipeTransform } from '@angular/core';
import { JourneyStatus } from '../../models/enums/journey-status.enum';

export interface JourneyTimingInfo {
  text: string;
  type: 'upcoming' | 'in-progress' | 'completed' | 'open-ended' | 'unknown';
  daysCount?: number;
}

@Pipe({
  name: 'journeyTiming',
  standalone: true,
})
export class JourneyTimingPipe implements PipeTransform {
  transform(
    status: JourneyStatus,
    daysUntilStart?: number | null,
    journeyDurationInDays?: number | null,
    startDate?: Date | null,
    endDate?: Date | null,
  ): JourneyTimingInfo {
    switch (status) {
      case JourneyStatus.Upcoming:
        if (daysUntilStart !== null && daysUntilStart !== undefined) {
          const daysText = daysUntilStart === 1 ? 'day' : 'days';
          return {
            text: `Trip starts in ${daysUntilStart} ${daysText}`,
            type: 'upcoming',
            daysCount: daysUntilStart,
          };
        }
        return {
          text: 'Trip starting soon',
          type: 'upcoming',
        };

      case JourneyStatus.InProgress:
        if (endDate) {
          const today = new Date();
          const end = new Date(endDate);
          const daysRemaining = Math.ceil(
            (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
          );

          if (daysRemaining > 0) {
            const daysText = daysRemaining === 1 ? 'day' : 'days';
            return {
              text: `${daysRemaining} ${daysText} remaining`,
              type: 'in-progress',
              daysCount: daysRemaining,
            };
          }
        }

        return {
          text: 'Trip in progress',
          type: 'in-progress',
        };

      case JourneyStatus.Completed:
        if (
          journeyDurationInDays !== null &&
          journeyDurationInDays !== undefined &&
          journeyDurationInDays > 0
        ) {
          const daysText = journeyDurationInDays === 1 ? 'day' : 'days';
          return {
            text: `Trip completed (${journeyDurationInDays} ${daysText})`,
            type: 'completed',
            daysCount: journeyDurationInDays,
          };
        }
        return {
          text: 'Trip completed',
          type: 'completed',
        };

      default:
        if (startDate && !endDate) {
          return {
            text: 'Open-ended trip',
            type: 'open-ended',
          };
        }

        if (!startDate && !endDate) {
          return {
            text: 'Dates to be determined',
            type: 'unknown',
          };
        }

        return {
          text: 'Trip dates planned',
          type: 'unknown',
        };
    }
  }
}
