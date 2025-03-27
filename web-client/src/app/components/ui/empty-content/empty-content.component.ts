import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ButtonComponent } from '../../buttons/button/button.component';

@Component({
  selector: 'ts-empty-content',
  imports: [FontAwesomeModule, ButtonComponent],
  templateUrl: './empty-content.component.html',
  styleUrl: './empty-content.component.scss',
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
