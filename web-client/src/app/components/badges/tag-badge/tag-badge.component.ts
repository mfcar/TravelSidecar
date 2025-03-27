import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'ts-tag-badge',
  imports: [NgClass],
  templateUrl: './tag-badge.component.html',
  styleUrl: './tag-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagBadgeComponent {
  label = input.required<string>();
  color = input.required<string>();

  /// Based on the W3C Color Contrast Ratio recommendation
  /// https://www.w3.org/TR/AERT/#color-contrast
  textColor = computed(() => {
    const color = this.color();
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

    return luminance > 125 ? 'text-gray-900' : 'text-white';
  });
}
