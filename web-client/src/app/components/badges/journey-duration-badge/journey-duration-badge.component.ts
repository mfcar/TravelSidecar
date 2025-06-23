import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Journey } from '../../../models/journeys.model';
import {
  JourneyDurationInfo,
  JourneyDurationPipe,
} from '../../../shared/pipes/journey-duration.pipe';

@Component({
  selector: 'ts-journey-duration-badge',
  imports: [NgClass, FontAwesomeModule],
  template: `
    @if (durationInfo()) {
      <div
        class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium"
        [ngClass]="badgeClasses()"
      >
        <fa-icon class="text-xs" [icon]="['fas', 'clock']" [fixedWidth]="true" />
        <span>{{ durationInfo()!.text }}</span>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JourneyDurationBadgeComponent {
  journey = input.required<Journey>();

  private journeyDurationPipe = new JourneyDurationPipe();

  durationInfo = computed((): JourneyDurationInfo | null => {
    const j = this.journey();
    return this.journeyDurationPipe.transform(j.startDate, j.endDate);
  });

  badgeClasses = computed(() => {
    const baseClasses = 'transition-colors duration-200';
    return `${baseClasses} bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300`;
  });
}
