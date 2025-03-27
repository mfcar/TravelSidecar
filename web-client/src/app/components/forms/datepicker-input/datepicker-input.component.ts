import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ts-datepicker-input',
  imports: [],
  templateUrl: './datepicker-input.component.html',
  styleUrl: './datepicker-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerInputComponent {}
