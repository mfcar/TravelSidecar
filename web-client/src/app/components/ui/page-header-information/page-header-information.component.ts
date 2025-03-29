import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'ts-page-header-information',
  imports: [FontAwesomeModule],
  template: `
    <div class="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-300">
      @if (icon()) {
        <fa-icon
          class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500"
          [icon]="['fas', icon()!]"
        />
      }
      {{ text() }}
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderInformationComponent {
  icon = input<string>();
  text = input.required<string>();
}
