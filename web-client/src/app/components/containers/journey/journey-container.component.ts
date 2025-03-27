import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ts-journey',
  imports: [],
  templateUrl: './journey-container.component.html',
  styleUrl: './journey.container.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JourneyContainer {}
