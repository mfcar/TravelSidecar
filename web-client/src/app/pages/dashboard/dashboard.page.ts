import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ts-dashboard',
  imports: [],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {}
