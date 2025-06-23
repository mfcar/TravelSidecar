import { Pipe, PipeTransform } from '@angular/core';
import { JourneyStatus } from '../../models/enums/journey-status.enum';

export interface JourneyStatusInfo {
  text: string;
  type: 'upcoming' | 'in-progress' | 'completed' | 'open-ended' | 'unknown';
  daysCount?: number;
}

@Pipe({
  name: 'journeyStatus',
  standalone: true,
})
export class JourneyStatusPipe implements PipeTransform {
  transform(
    status: JourneyStatus,
    startDate?: Date | null,
    endDate?: Date | null,
  ): JourneyStatusInfo {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (status) {
      case JourneyStatus.Upcoming:
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          const daysUntilStart = Math.ceil(
            (start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
          );

          if (daysUntilStart > 0) {
            const daysText = daysUntilStart === 1 ? 'day' : 'days';
            return {
              text: `Starts in ${daysUntilStart} ${daysText}`,
              type: 'upcoming',
              daysCount: daysUntilStart,
            };
          } else if (daysUntilStart === 0) {
            return {
              text: 'Starts today',
              type: 'upcoming',
              daysCount: 0,
            };
          }
        }
        return {
          text: 'Starting soon',
          type: 'upcoming',
        };

      case JourneyStatus.InProgress:
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(0, 0, 0, 0);
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
          } else if (daysRemaining === 0) {
            return {
              text: 'Ends today',
              type: 'in-progress',
              daysCount: 0,
            };
          }
        }

        return {
          text: 'In progress',
          type: 'in-progress',
        };

      case JourneyStatus.Completed:
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(0, 0, 0, 0);
          const daysSinceEnd = Math.floor(
            (today.getTime() - end.getTime()) / (1000 * 60 * 60 * 24),
          );

          if (daysSinceEnd >= 0) {
            if (daysSinceEnd === 0) {
              return {
                text: 'Completed today',
                type: 'completed',
                daysCount: 0,
              };
            } else {
              const daysText = daysSinceEnd === 1 ? 'day' : 'days';
              return {
                text: `Completed ${daysSinceEnd} ${daysText} ago`,
                type: 'completed',
                daysCount: daysSinceEnd,
              };
            }
          }
        }
        return {
          text: 'Completed',
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
          text: 'Dates planned',
          type: 'unknown',
        };
    }
  }
}
