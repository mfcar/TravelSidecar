import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTags } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'ts-tag-badge',
  standalone: true,
  imports: [NgClass, FontAwesomeModule],
  template: `
    <span
      class="inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset transition-colors duration-200"
      [ngClass]="[
        lightClasses().bg,
        lightClasses().text,
        lightClasses().ring,
        darkClasses().bg,
        darkClasses().text,
        darkClasses().ring,
        hoverClasses().bg,
        hoverClasses().ring,
        cursorClass(),
      ]"
      [attr.role]="clickable() ? 'button' : undefined"
      [attr.tabindex]="clickable() ? '0' : undefined"
      (click)="navigateToTagDetails()"
      (keydown.enter)="navigateToTagDetails()"
    >
      @if (showIcon()) {
        <fa-icon class="h-3 w-3" [icon]="faTags" />
      }
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
  showIcon = input<boolean>(false);

  faTags = faTags;

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

  hoverClasses = computed(() => {
    if (!this.clickable()) {
      return {
        bg: '',
        ring: '',
      };
    }

    const colorName = this.color();

    if (!colorName) {
      return {
        bg: 'hover:bg-gray-100 dark:hover:bg-gray-500/20',
        ring: 'hover:ring-gray-600/20 dark:hover:ring-gray-400/30',
      };
    }

    switch (colorName) {
      case 'red':
        return {
          bg: 'hover:bg-red-100 dark:hover:bg-red-500/20',
          ring: 'hover:ring-red-700/20 dark:hover:ring-red-400/30',
        };
      case 'orange':
        return {
          bg: 'hover:bg-orange-100 dark:hover:bg-orange-500/20',
          ring: 'hover:ring-orange-700/20 dark:hover:ring-orange-400/30',
        };
      case 'amber':
        return {
          bg: 'hover:bg-amber-100 dark:hover:bg-amber-500/20',
          ring: 'hover:ring-amber-700/20 dark:hover:ring-amber-400/30',
        };
      case 'yellow':
        return {
          bg: 'hover:bg-yellow-100 dark:hover:bg-yellow-500/20',
          ring: 'hover:ring-yellow-700/20 dark:hover:ring-yellow-400/30',
        };
      case 'lime':
        return {
          bg: 'hover:bg-lime-100 dark:hover:bg-lime-500/20',
          ring: 'hover:ring-lime-700/20 dark:hover:ring-lime-400/30',
        };
      case 'green':
        return {
          bg: 'hover:bg-green-100 dark:hover:bg-green-600/20',
          ring: 'hover:ring-green-700/20 dark:hover:ring-green-500/30',
        };
      case 'emerald':
        return {
          bg: 'hover:bg-emerald-100 dark:hover:bg-emerald-500/20',
          ring: 'hover:ring-emerald-700/20 dark:hover:ring-emerald-400/30',
        };
      case 'teal':
        return {
          bg: 'hover:bg-teal-100 dark:hover:bg-teal-500/20',
          ring: 'hover:ring-teal-700/20 dark:hover:ring-teal-400/30',
        };
      case 'cyan':
        return {
          bg: 'hover:bg-cyan-100 dark:hover:bg-cyan-500/20',
          ring: 'hover:ring-cyan-700/20 dark:hover:ring-cyan-400/30',
        };
      case 'sky':
        return {
          bg: 'hover:bg-sky-100 dark:hover:bg-sky-500/20',
          ring: 'hover:ring-sky-700/20 dark:hover:ring-sky-400/30',
        };
      case 'blue':
        return {
          bg: 'hover:bg-blue-100 dark:hover:bg-blue-500/20',
          ring: 'hover:ring-blue-700/20 dark:hover:ring-blue-400/40',
        };
      case 'indigo':
        return {
          bg: 'hover:bg-indigo-100 dark:hover:bg-indigo-500/20',
          ring: 'hover:ring-indigo-700/20 dark:hover:ring-indigo-400/40',
        };
      case 'violet':
        return {
          bg: 'hover:bg-violet-100 dark:hover:bg-violet-500/20',
          ring: 'hover:ring-violet-700/20 dark:hover:ring-violet-400/40',
        };
      case 'purple':
        return {
          bg: 'hover:bg-purple-100 dark:hover:bg-purple-500/20',
          ring: 'hover:ring-purple-700/20 dark:hover:ring-purple-400/40',
        };
      case 'fuchsia':
        return {
          bg: 'hover:bg-fuchsia-100 dark:hover:bg-fuchsia-500/20',
          ring: 'hover:ring-fuchsia-700/20 dark:hover:ring-fuchsia-400/30',
        };
      case 'pink':
        return {
          bg: 'hover:bg-pink-100 dark:hover:bg-pink-500/20',
          ring: 'hover:ring-pink-700/20 dark:hover:ring-pink-400/30',
        };
      case 'rose':
        return {
          bg: 'hover:bg-rose-100 dark:hover:bg-rose-500/20',
          ring: 'hover:ring-rose-700/20 dark:hover:ring-rose-400/30',
        };
      case 'slate':
        return {
          bg: 'hover:bg-slate-100 dark:hover:bg-slate-500/20',
          ring: 'hover:ring-slate-700/20 dark:hover:ring-slate-400/30',
        };
      case 'gray':
        return {
          bg: 'hover:bg-gray-100 dark:hover:bg-gray-500/20',
          ring: 'hover:ring-gray-700/20 dark:hover:ring-gray-400/30',
        };
      case 'zinc':
        return {
          bg: 'hover:bg-zinc-100 dark:hover:bg-zinc-500/20',
          ring: 'hover:ring-zinc-700/20 dark:hover:ring-zinc-400/30',
        };
      case 'neutral':
        return {
          bg: 'hover:bg-neutral-100 dark:hover:bg-neutral-500/20',
          ring: 'hover:ring-neutral-700/20 dark:hover:ring-neutral-400/30',
        };
      case 'stone':
        return {
          bg: 'hover:bg-stone-100 dark:hover:bg-stone-500/20',
          ring: 'hover:ring-stone-700/20 dark:hover:ring-stone-400/30',
        };
      default:
        return {
          bg: 'hover:bg-gray-100 dark:hover:bg-gray-500/20',
          ring: 'hover:ring-gray-600/20 dark:hover:ring-gray-400/30',
        };
    }
  });
}
