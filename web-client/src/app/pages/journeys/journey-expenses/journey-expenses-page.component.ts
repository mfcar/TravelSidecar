import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ts-journey-expenses',
  imports: [],
  templateUrl: './journey-expenses-page.component.html',
  styleUrl: './journey-expenses.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JourneyExpensesPage {}
