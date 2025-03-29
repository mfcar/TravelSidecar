import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ts-stat-group',
  imports: [],
  template: `
    <div>
      @if (title()) {
        <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
          {{ title() }}
        </h3>
      }
      <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        <ng-content />
      </dl>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatGroupComponent {
  title = input<string | null>(null);
}
