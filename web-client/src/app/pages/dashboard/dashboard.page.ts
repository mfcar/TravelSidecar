import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ts-dashboard',
  imports: [],
  templateUrl: './dashboard.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {}
