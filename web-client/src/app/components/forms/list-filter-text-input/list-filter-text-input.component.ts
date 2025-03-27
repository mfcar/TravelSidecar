import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'ts-list-filter-text-input',
  imports: [FontAwesomeModule],
  templateUrl: './list-filter-text-input.component.html',
  styleUrl: './list-filter-text-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListFilterTextInputComponent {
  autocomplete = input<string | boolean>('off');
  placeholder = input<string>('Search by...');
  filterValue = input<string>('');
  filterValueChange = output<string>();

  onInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filterValueChange.emit(value);
  }
}
