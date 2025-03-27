import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ts-time-only-input',
  imports: [],
  templateUrl: './time-only-input.component.html',
  styleUrl: './time-only-input.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeOnlyInputComponent {}
