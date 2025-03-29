import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'ts-stat',
  imports: [FontAwesomeModule],
  template: `
    <div
      class="relative overflow-hidden rounded-lg bg-white dark:bg-white/10 px-4 pt-2 shadow sm:px-6 sm:pt-3"
    >
      <dt>
        <div class="absolute rounded-md bg-sky-500 dark:bg-sky-600 p-3">
          <fa-icon class="h-6 w-6 text-white" [icon]="['fas', icon()!]" [fixedWidth]="true" />
        </div>
        <p class="ml-16 truncate text-sm font-medium text-gray-500 dark:text-gray-400">
          {{ title() }}
        </p>
      </dt>
      <dd class="ml-16 flex items-baseline pb-2">
        <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ value() }}</p>
      </dd>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatComponent {
  title = input.required<string>();
  value = input.required<string | number>();
  icon = input<string | null>(null);
}
