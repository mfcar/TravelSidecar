import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faList } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'ts-category-badge',
  standalone: true,
  imports: [NgClass, FontAwesomeModule, RouterLink],
  template: `
    <a
      class="inline-flex items-center gap-x-1.5 rounded-md px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
      [routerLink]="clickable() && categoryId() ? ['/journey-categories', categoryId()] : null"
      [ngClass]="[cursorClass()]"
      [attr.role]="clickable() ? 'button' : undefined"
      [attr.tabindex]="clickable() ? '0' : undefined"
    >
      @if (showIcon()) {
        <fa-icon class="h-3 w-3" [icon]="faList" />
      }
      @if (showLabel()) {
        <span class="text-xs font-medium text-gray-500 dark:text-gray-400 mr-1">
          {{ labelText() }}:
        </span>
      }
      {{ name() }}
    </a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryBadgeComponent {
  name = input.required<string>();
  clickable = input<boolean>(false);
  categoryId = input<string | undefined>(undefined);
  showIcon = input<boolean>(false);
  showLabel = input<boolean>(false);
  labelText = input<string>('Category');

  faList = faList;

  router = inject(Router);

  cursorClass = computed(() => {
    return this.clickable() ? 'cursor-pointer' : 'cursor-default';
  });
}
