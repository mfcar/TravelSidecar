import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Journey } from '../../../models/journeys.model';
import { JourneyStatusInfo, JourneyStatusPipe } from '../../../shared/pipes/journey-status.pipe';

@Component({
  selector: 'ts-journey-timing-badge',
  imports: [NgClass, FontAwesomeModule],
  template: `
    <div
      class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium"
      [ngClass]="badgeClasses()"
    >
      <fa-icon class="text-xs" [icon]="iconForType(timingInfo().type)" [fixedWidth]="true" />
      <span>{{ timingInfo().text }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JourneyTimingBadgeComponent {
  journey = input.required<Journey>();

  private journeyStatusPipe = new JourneyStatusPipe();

  timingInfo = computed((): JourneyStatusInfo => {
    const j = this.journey();
    return this.journeyStatusPipe.transform(j.status, j.startDate, j.endDate);
  });

  badgeClasses = computed(() => {
    const type = this.timingInfo().type;
    const baseClasses = 'transition-colors duration-200';

    switch (type) {
      case 'upcoming':
        return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300`;
      case 'in-progress':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300`;
      case 'completed':
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
      case 'open-ended':
        return `${baseClasses} bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400`;
    }
  });

  iconForType(type: JourneyStatusInfo['type']): [string, string] {
    switch (type) {
      case 'upcoming':
        return ['fas', 'calendar-days'];
      case 'in-progress':
        return ['fas', 'plane'];
      case 'completed':
        return ['fas', 'check-circle'];
      case 'open-ended':
        return ['fas', 'infinity'];
      default:
        return ['fas', 'question-circle'];
    }
  }
}
