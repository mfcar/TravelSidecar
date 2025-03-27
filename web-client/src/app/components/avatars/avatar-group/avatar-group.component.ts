import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AvatarComponent, AvatarSize } from '../avatar/avatar.component';

@Component({
  selector: 'ts-avatar-group',
  imports: [NgClass, AvatarComponent],
  templateUrl: './avatar-group.component.html',
  styleUrl: './avatar-group.component.css',
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
