import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'ts-application-logo',
  imports: [NgOptimizedImage],
  template: `
    <img
      class="{{ cssClass() }}"
      [ngSrc]="logoUrl()"
      [height]="height()"
      [width]="width()"
      alt="TravelSidecar Logo"
      priority
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationLogoComponent {
  height = input<number>(48);
  width = input<number>(48);
  cssClass = input<string>('');
  size = input<'tiny' | 'small' | 'original'>('small');

  logoUrl = computed(() => {
    switch (this.size()) {
      case 'tiny':
        return '/images/logos/logo_tiny.png';
      case 'small':
        return '/images/logos/logo_small.png';
      case 'original':
        return '/images/logos/logo_original.png';
      default:
        return '/images/logos/logo_small.png';
    }
  });
}
