import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ts-sticky-list-tools',
  imports: [],
  template: `
    <div
      class="sticky top-16 z-10 bg-white dark:bg-gray-900 pt-4 pb-2 mb-2"
      [class.border-b]="showBorder()"
      [class.border-gray-200]="showBorder()"
      [class.dark:border-gray-700]="showBorder()"
    >
      <ng-content />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StickyListToolsComponent {
  showBorder = input<boolean>(true);
}
