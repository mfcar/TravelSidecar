import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ts-sticky-list-tools',
  imports: [],
  template: `
    <div
      class="sticky top-16 z-10 bg-white dark:bg-gray-900 pt-4 pb-2 border-b border-gray-200 dark:border-gray-700"
    >
      <ng-content />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StickyListToolsComponent {}
