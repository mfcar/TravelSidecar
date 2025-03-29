import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AvatarComponent, AvatarSize } from '../avatar/avatar.component';

@Component({
  selector: 'ts-avatar-group',
  imports: [NgClass, AvatarComponent],
  template: `
    <div
      class="flex overflow-hidden"
      [ngClass]="[spacingClass()]"
      [attr.aria-label]="usernames().length + ' users'"
      i18n-aria-label="@@usersInGroup"
      role="group"
    >
      @for (username of displayedUsernames(); track username) {
        <div class="relative inline-block ring-2 ring-white dark:ring-gray-800">
          <ts-avatar [username]="username" [size]="size()" />
        </div>
      }

      @if (extraCount() > 0) {
        <div class="relative inline-block">
          <div
            class="inline-flex items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white font-medium ring-2 ring-white dark:ring-gray-800"
            [ngClass]="[
              size() === 'xs' ? 'h-6 w-6 text-xs' : '',
              size() === 'sm' ? 'h-8 w-8 text-xs' : '',
              size() === 'md' ? 'h-10 w-10 text-sm' : '',
              size() === 'lg' ? 'h-12 w-12 text-base' : '',
              size() === 'xl' ? 'h-14 w-14 text-lg' : '',
            ]"
            [attr.aria-label]="extraCount() + ' more users'"
            i18n-aria-label="@@moreUsers"
          >
            <span>{{ getExtraCountText() }}</span>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarGroupComponent {
  usernames = input.required<string[]>();
  size = input<AvatarSize>('md');
  maxDisplayed = input<number>(4);

  protected spacingClass = computed(() => {
    switch (this.size()) {
      case 'xs':
        return '-space-x-1';
      case 'sm':
        return '-space-x-2';
      case 'md':
        return '-space-x-2';
      case 'lg':
        return '-space-x-3';
      case 'xl':
        return '-space-x-4';
      default:
        return '-space-x-2';
    }
  });

  protected displayedUsernames = computed(() => {
    const max = this.maxDisplayed();
    const names = this.usernames();

    if (names.length <= max) {
      return names;
    }

    return names.slice(0, max);
  });

  protected extraCount = computed(() => {
    const total = this.usernames().length;
    const max = this.maxDisplayed();
    return total > max ? total - max : 0;
  });

  protected getExtraCountText(): string {
    const count = this.extraCount();
    return count > 0 ? `+${count}` : '';
  }
}
