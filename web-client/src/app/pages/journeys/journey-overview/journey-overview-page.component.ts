import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ts-journey-overview',
  imports: [],
  templateUrl: './journey-overview-page.component.html',
  styleUrl: './journey-overview.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JourneyOverviewPage {}
