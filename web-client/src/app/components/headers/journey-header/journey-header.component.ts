import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Journey } from '../../../models/journeys.model';
import { CategoryBadgeComponent } from '../../badges/category-badge/category-badge.component';
import { JourneyDurationBadgeComponent } from '../../badges/journey-duration-badge/journey-duration-badge.component';
import { JourneyTimingBadgeComponent } from '../../badges/journey-timing-badge/journey-timing-badge.component';
import { TagBadgeComponent } from '../../badges/tag-badge/tag-badge.component';
import { ButtonComponent } from '../../buttons/button/button.component';

@Component({
  selector: 'ts-journey-header',
  imports: [
    ButtonComponent,
    TagBadgeComponent,
    CategoryBadgeComponent,
    JourneyTimingBadgeComponent,
    JourneyDurationBadgeComponent,
  ],
  templateUrl: './journey-header.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JourneyHeaderComponent {
  journey = input<Journey | null>(null);
  readonly placeholderImage = '/images/placeholders/JourneyPlaceholder.png';

  editJourney = output<void>();
  addActivity = output<void>();
  changeImage = output<void>();

  onEditClick(): void {
    this.editJourney.emit();
  }

  onAddActivityClick(): void {
    this.addActivity.emit();
  }

  onChangeImageClick(): void {
    this.changeImage.emit();
  }

  getJourneyImageUrl(size: string): string {
    const currentJourney = this.journey();
    if (!currentJourney?.coverImageId) {
      return this.placeholderImage;
    }

    return `${environment.apiBaseUrl}/journeys/${currentJourney.id}/cover/${currentJourney.coverImageId}/${size}`;
  }

  getJourneyImageSrcSet(): string {
    const currentJourney = this.journey();
    if (!currentJourney?.coverImageId) {
      return '';
    }

    return `
      ${this.getJourneyImageUrl('Normal')} 1920w,
      ${this.getJourneyImageUrl('Medium')} 800w,
      ${this.getJourneyImageUrl('Small')} 400w
    `.trim();
  }
}
