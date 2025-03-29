import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ButtonComponent } from '../../buttons/button/button.component';

@Component({
  selector: 'ts-empty-content',
  imports: [FontAwesomeModule, ButtonComponent],
  template: `
    <div
      class="text-center my-24 block w-5/6 md:w-3/5 mx-auto rounded-lg border-2 border-dashed border-gray-300 p-12 hover:border-gray-400"
    >
      <fa-icon
        class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-400"
        [icon]="['fas', icon()]"
        size="3x"
        [fixedWidth]="true"
      />
      <h3 class="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
        {{ title() }}
      </h3>
      @if (subtitle()) {
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ subtitle() }}
        </p>
      }
      <div class="mt-6">
        <ts-button
          [label]="buttonLabel()"
          size="lg"
          icon="plus"
          variant="primary"
          (buttonAction)="onNewItemButtonClicked()"
        />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyContentComponent {
  icon = input<string>('folder-plus');
  title = input<string>('No Items Found');
  subtitle = input<string>('Get started by adding a new item');
  buttonLabel = input<string>('Add Item');
  newItemButtonAction = output<void>();

  onNewItemButtonClicked() {
    this.newItemButtonAction.emit();
  }
}
