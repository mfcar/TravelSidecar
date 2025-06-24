import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

export enum ActivitiesViewMode {
  ByTime = 'byTime',
  Manual = 'manual',
}

@Component({
  selector: 'ts-activities-view-toggle',
  imports: [FontAwesomeModule, NgClass],
  templateUrl: './activities-view-toggle.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivitiesViewToggleComponent {
  viewMode = input<ActivitiesViewMode>(ActivitiesViewMode.ByTime);

  viewModeChange = output<ActivitiesViewMode>();

  onToggleViewMode(mode: ActivitiesViewMode): void {
    if (mode !== this.viewMode()) {
      this.viewModeChange.emit(mode);
    }
  }

  readonly ActivitiesViewMode = ActivitiesViewMode;
}
