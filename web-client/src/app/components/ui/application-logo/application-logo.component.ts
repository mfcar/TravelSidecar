import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ts-application-logo',
  imports: [NgOptimizedImage],
  templateUrl: './application-logo.component.html',
  styleUrl: './application-logo.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationLogoComponent {
  height = input<number>(8);
  width = input<number>(32);
  cssClass = input<string>('');

  readonly logoUrl = `https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600`;
}
