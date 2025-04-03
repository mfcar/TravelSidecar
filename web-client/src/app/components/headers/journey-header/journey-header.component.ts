import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Journey } from '../../../models/journeys.model';
import { ButtonComponent } from '../../buttons/button/button.component';

@Component({
  selector: 'ts-journey-header',
  imports: [ButtonComponent, NgOptimizedImage],
  templateUrl: './journey-header.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JourneyHeaderComponent {
  journey = input<Journey | null>(null);
  readonly placeholderImage = '/images/placeholders/JourneyPlaceholder.png';

  editJourney = output<void>();
  addActivity = output<void>();

  onEditClick(): void {
    this.editJourney.emit();
  }

  onAddActivityClick(): void {
    this.addActivity.emit();
  }
}
