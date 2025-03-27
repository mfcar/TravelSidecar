import { NgPlural, NgPluralCase } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent } from '../../buttons/button/button.component';
import { LoadingIndicatorComponent } from '../loading-indicator/loading-indicator.component';

@Component({
  selector: 'ts-list-status',
  imports: [LoadingIndicatorComponent, NgPlural, NgPluralCase, ButtonComponent],
  templateUrl: './list-status.component.html',
  styleUrl: './list-status.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListStatusComponent {
  count = input.required<number>();
  isLoading = input.required<boolean>();
  isFiltered = input<boolean>(false);
  resetFilterAction = output<void>();

  onResetFilterButtonClick() {
    this.resetFilterAction.emit();
  }
}
