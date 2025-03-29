import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output, TemplateRef } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ButtonComponent } from '../../buttons/button/button.component';

export interface ColumnConfig<T extends Record<string, any>> {
  key: string;
  header: string;
  cellTemplate?: TemplateRef<any>;
  stackLabelTemplate?: TemplateRef<any>;
  gridLabelTemplate?: TemplateRef<any>;
  sortable?: boolean;
}

@Component({
  selector: 'ts-table-list',
  imports: [FontAwesomeModule, ButtonComponent, CommonModule],
  templateUrl: './table-list.view-mode.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableListViewMode<T extends Record<string, any>> {
  items = input<T[]>([]);
  columns = input<ColumnConfig<T>[]>([]);
  sortBy = input<string>('');
  sortDirection = input<'asc' | 'desc'>('asc');
  selectedFields = input.required<Set<string>>();

  sortChanged = output<{ sortBy: string; sortDirection: 'asc' | 'desc' }>();
  editButtonClicked = output<T>();
  deleteButtonClicked = output<T>();

  onEditButtonClicked(item: T) {
    this.editButtonClicked.emit(item);
  }

  onDeleteButtonClicked(item: T) {
    this.deleteButtonClicked.emit(item);
  }

  onHeaderClicked(column: ColumnConfig<T>) {
    if (column.sortable === false) {
      return;
    }
    let newDirection: 'asc' | 'desc' = 'asc';
    if (this.sortBy() === column.key) {
      newDirection = this.sortDirection() === 'asc' ? 'desc' : 'asc';
    }
    this.sortChanged.emit({ sortBy: column.key, sortDirection: newDirection });
  }

  getSortAriaLabel(column: ColumnConfig<T>): string {
    if (this.sortBy() === column.key) {
      return this.sortDirection() === 'asc'
        ? $localize`:@@sortDescendingAriaLabel:Sort ${column.header} descending`
        : $localize`:@@sortAscendingAriaLabel:Sort ${column.header} ascending`;
    }
    return $localize`:@@sortColumnAriaLabel:Sort by ${column.header}`;
  }
}
