import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ts-timezone-selector-input',
  imports: [],
  templateUrl: './timezone-selector-input.component.html',
  styleUrl: './timezone-selector-input.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimezoneSelectorInputComponent {}
