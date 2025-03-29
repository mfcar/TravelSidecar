import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarShape = 'circular' | 'rounded';

@Component({
  selector: 'ts-avatar',
  imports: [NgClass],
  template: `
    <span
      class="inline-flex items-center justify-center font-medium leading-none text-white"
      [ngClass]="[sizeClasses(), backgroundColor(), shapeClass()]"
      i18n-aria-label="@@userAvatarLabel"
      [attr.aria-label]="'User avatar for ' + username()"
      role="img"
    >
      <span>{{ initials() }}</span>
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarComponent {
  username = input.required<string>();
  size = input<AvatarSize>('md');
  shape = input<AvatarShape>('circular');

  protected initials = computed(() => {
    const name = this.username()?.trim();
    if (!name) return '';

    const chars = name.length >= 2 ? 2 : 1;
    return name.substring(0, chars).toUpperCase();
  });

  protected sizeClasses = computed(() => {
    switch (this.size()) {
      case 'xs':
        return 'h-6 w-6 text-xs';
      case 'sm':
        return 'h-8 w-8 text-sm';
      case 'md':
        return 'h-10 w-10 text-base';
      case 'lg':
        return 'h-12 w-12 text-lg';
      case 'xl':
        return 'h-14 w-14 text-xl';
      default:
        return 'h-10 w-10 text-base';
    }
  });

  protected shapeClass = computed(() => {
    return this.shape() === 'rounded' ? 'rounded-md' : 'rounded-full';
  });

  protected backgroundColor = computed(() => {
    const name = this.username();
    if (!name) return 'bg-gray-500 dark:bg-gray-600';

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const colors = [
      'bg-sky-500 dark:bg-sky-600',
      'bg-emerald-500 dark:bg-emerald-600',
      'bg-violet-500 dark:bg-violet-600',
      'bg-amber-500 dark:bg-amber-600',
      'bg-rose-500 dark:bg-rose-600',
      'bg-indigo-500 dark:bg-indigo-600',
      'bg-pink-500 dark:bg-pink-600',
      'bg-teal-500 dark:bg-teal-600',
    ];

    const index = Math.abs(hash) % colors.length;
    return colors[index];
  });
}
