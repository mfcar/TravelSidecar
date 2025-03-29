import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'ts-tag-badge',
  standalone: true,
  imports: [NgClass],
  template: `
    <span
      class="inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset"
      [ngClass]="[
        lightClasses().bg,
        lightClasses().text,
        lightClasses().ring,
        darkClasses().bg,
        darkClasses().text,
        darkClasses().ring,
        cursorClass(),
      ]"
      [attr.role]="clickable() ? 'button' : undefined"
      [attr.tabindex]="clickable() ? '0' : undefined"
      (click)="navigateToTagDetails()"
      (keydown.enter)="navigateToTagDetails()"
    >
      {{ label() }}
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagBadgeComponent {
  label = input.required<string>();
  color = input.required<string>();
  clickable = input<boolean>(false);
  tagId = input<string | undefined>(undefined);

  router = inject(Router);

  navigateToTagDetails(): void {
    if (this.clickable() && this.tagId()) {
      this.router.navigate(['/tags', this.tagId()]);
    }
  }

  cursorClass = computed(() => {
    return this.clickable() ? 'cursor-pointer' : 'cursor-default';
  });

  lightClasses = computed(() => {
    const colorName = this.color();

    if (!colorName) {
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-600',
        ring: 'ring-gray-500/10',
      };
    }

    switch (colorName) {
      case 'red':
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          ring: 'ring-red-600/10',
        };
      case 'orange':
        return {
          bg: 'bg-orange-50',
          text: 'text-orange-700',
          ring: 'ring-orange-600/10',
        };
      case 'amber':
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          ring: 'ring-amber-600/10',
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-50',
          text: 'text-yellow-700',
          ring: 'ring-yellow-600/10',
        };
      case 'lime':
        return {
          bg: 'bg-lime-50',
          text: 'text-lime-700',
          ring: 'ring-lime-600/10',
        };
      case 'green':
        return {
          bg: 'bg-green-50',
          text: 'text-green-700',
          ring: 'ring-green-600/10',
        };
      case 'emerald':
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          ring: 'ring-emerald-600/10',
        };
      case 'teal':
        return {
          bg: 'bg-teal-50',
          text: 'text-teal-700',
          ring: 'ring-teal-600/10',
        };
      case 'cyan':
        return {
          bg: 'bg-cyan-50',
          text: 'text-cyan-700',
          ring: 'ring-cyan-600/10',
        };
      case 'sky':
        return {
          bg: 'bg-sky-50',
          text: 'text-sky-700',
          ring: 'ring-sky-600/10',
        };
      case 'blue':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          ring: 'ring-blue-600/10',
        };
      case 'indigo':
        return {
          bg: 'bg-indigo-50',
          text: 'text-indigo-700',
          ring: 'ring-indigo-600/10',
        };
      case 'violet':
        return {
          bg: 'bg-violet-50',
          text: 'text-violet-700',
          ring: 'ring-violet-600/10',
        };
      case 'purple':
        return {
          bg: 'bg-purple-50',
          text: 'text-purple-700',
          ring: 'ring-purple-600/10',
        };
      case 'fuchsia':
        return {
          bg: 'bg-fuchsia-50',
          text: 'text-fuchsia-700',
          ring: 'ring-fuchsia-600/10',
        };
      case 'pink':
        return {
          bg: 'bg-pink-50',
          text: 'text-pink-700',
          ring: 'ring-pink-600/10',
        };
      case 'rose':
        return {
          bg: 'bg-rose-50',
          text: 'text-rose-700',
          ring: 'ring-rose-600/10',
        };
      case 'slate':
        return {
          bg: 'bg-slate-50',
          text: 'text-slate-700',
          ring: 'ring-slate-600/10',
        };
      case 'gray':
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          ring: 'ring-gray-600/10',
        };
      case 'zinc':
        return {
          bg: 'bg-zinc-50',
          text: 'text-zinc-700',
          ring: 'ring-zinc-600/10',
        };
      case 'neutral':
        return {
          bg: 'bg-neutral-50',
          text: 'text-neutral-700',
          ring: 'ring-neutral-600/10',
        };
      case 'stone':
        return {
          bg: 'bg-stone-50',
          text: 'text-stone-700',
          ring: 'ring-stone-600/10',
        };
      default:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-600',
          ring: 'ring-gray-500/10',
        };
    }
  });

  darkClasses = computed(() => {
    const colorName = this.color();

    if (!colorName) {
      return {
        bg: 'dark:bg-gray-400/10',
        text: 'dark:text-gray-400',
        ring: 'dark:ring-gray-400/20',
      };
    }

    switch (colorName) {
      case 'red':
        return {
          bg: 'dark:bg-red-400/10',
          text: 'dark:text-red-400',
          ring: 'dark:ring-red-400/20',
        };
      case 'orange':
        return {
          bg: 'dark:bg-orange-400/10',
          text: 'dark:text-orange-400',
          ring: 'dark:ring-orange-400/20',
        };
      case 'amber':
        return {
          bg: 'dark:bg-amber-400/10',
          text: 'dark:text-amber-400',
          ring: 'dark:ring-amber-400/20',
        };
      case 'yellow':
        return {
          bg: 'dark:bg-yellow-400/10',
          text: 'dark:text-yellow-500',
          ring: 'dark:ring-yellow-400/20',
        };
      case 'lime':
        return {
          bg: 'dark:bg-lime-400/10',
          text: 'dark:text-lime-400',
          ring: 'dark:ring-lime-400/20',
        };
      case 'green':
        return {
          bg: 'dark:bg-green-500/10',
          text: 'dark:text-green-400',
          ring: 'dark:ring-green-500/20',
        };
      case 'emerald':
        return {
          bg: 'dark:bg-emerald-400/10',
          text: 'dark:text-emerald-400',
          ring: 'dark:ring-emerald-400/20',
        };
      case 'teal':
        return {
          bg: 'dark:bg-teal-400/10',
          text: 'dark:text-teal-400',
          ring: 'dark:ring-teal-400/20',
        };
      case 'cyan':
        return {
          bg: 'dark:bg-cyan-400/10',
          text: 'dark:text-cyan-400',
          ring: 'dark:ring-cyan-400/20',
        };
      case 'sky':
        return {
          bg: 'dark:bg-sky-400/10',
          text: 'dark:text-sky-400',
          ring: 'dark:ring-sky-400/20',
        };
      case 'blue':
        return {
          bg: 'dark:bg-blue-400/10',
          text: 'dark:text-blue-400',
          ring: 'dark:ring-blue-400/30',
        };
      case 'indigo':
        return {
          bg: 'dark:bg-indigo-400/10',
          text: 'dark:text-indigo-400',
          ring: 'dark:ring-indigo-400/30',
        };
      case 'violet':
        return {
          bg: 'dark:bg-violet-400/10',
          text: 'dark:text-violet-400',
          ring: 'dark:ring-violet-400/30',
        };
      case 'purple':
        return {
          bg: 'dark:bg-purple-400/10',
          text: 'dark:text-purple-400',
          ring: 'dark:ring-purple-400/30',
        };
      case 'fuchsia':
        return {
          bg: 'dark:bg-fuchsia-400/10',
          text: 'dark:text-fuchsia-400',
          ring: 'dark:ring-fuchsia-400/20',
        };
      case 'pink':
        return {
          bg: 'dark:bg-pink-400/10',
          text: 'dark:text-pink-400',
          ring: 'dark:ring-pink-400/20',
        };
      case 'rose':
        return {
          bg: 'dark:bg-rose-400/10',
          text: 'dark:text-rose-400',
          ring: 'dark:ring-rose-400/20',
        };
      case 'slate':
        return {
          bg: 'dark:bg-slate-400/10',
          text: 'dark:text-slate-400',
          ring: 'dark:ring-slate-400/20',
        };
      case 'gray':
        return {
          bg: 'dark:bg-gray-400/10',
          text: 'dark:text-gray-400',
          ring: 'dark:ring-gray-400/20',
        };
      case 'zinc':
        return {
          bg: 'dark:bg-zinc-400/10',
          text: 'dark:text-zinc-400',
          ring: 'dark:ring-zinc-400/20',
        };
      case 'neutral':
        return {
          bg: 'dark:bg-neutral-400/10',
          text: 'dark:text-neutral-400',
          ring: 'dark:ring-neutral-400/20',
        };
      case 'stone':
        return {
          bg: 'dark:bg-stone-400/10',
          text: 'dark:text-stone-400',
          ring: 'dark:ring-stone-400/20',
        };
      default:
        return {
          bg: 'dark:bg-gray-400/10',
          text: 'dark:text-gray-400',
          ring: 'dark:ring-gray-400/20',
        };
    }
  });
}
