import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ts-time-only-input',
  imports: [],
  templateUrl: './time-only-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeOnlyInputComponent {}
