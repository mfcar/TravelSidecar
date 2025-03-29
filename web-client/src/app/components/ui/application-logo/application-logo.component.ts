import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ts-application-logo',
  imports: [NgOptimizedImage],
  template: `
    <img
      class="{{ cssClass() }}"
      [ngSrc]="logoUrl"
      [height]="height()"
      [width]="width()"
      alt="TravelSidecar Logo"
      priority
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationLogoComponent {
  height = input<number>(8);
  width = input<number>(32);
  cssClass = input<string>('');

  readonly logoUrl = `https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600`;
}
