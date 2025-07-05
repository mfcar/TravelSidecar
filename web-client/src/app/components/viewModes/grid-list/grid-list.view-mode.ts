import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  TemplateRef,
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ColumnConfig } from '../table-list/table-list.view-mode';

@Component({
  selector: 'ts-grid-list',
  imports: [CommonModule, FontAwesomeModule, NgOptimizedImage],
  templateUrl: './grid-list.view-mode.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridListViewMode<T> {
  items = input<T[]>([]);
  columns = input<ColumnConfig<T>[]>([]);
  selectedFields = input.required<Set<string>>();
  hasImage = input<boolean>(false);
  placeholderImage = input<string | undefined | null>(null);
  imageUrlGetter = input<((item: T) => string | null | undefined) | undefined>();

  editButtonClicked = output<T>();
  deleteButtonClicked = output<T>();

  primaryField = computed(() => {
    for (const column of this.columns()) {
      if (this.selectedFields().has(column.key)) {
        return column.key;
      }
    }
    return '';
  });

  onEditButtonClicked(item: T): void {
    this.editButtonClicked.emit(item);
  }

  getCellTemplate(column: ColumnConfig<T>): TemplateRef<{ $implicit: T }> | null {
    return column.gridLabelTemplate || column.stackLabelTemplate || column.cellTemplate || null;
  }

  hasValue(item: T, column: ColumnConfig<T>): boolean {
    if (!column.getValue) {
      return false;
    }
    const value = column.getValue(item);
    if (column.key === 'tags') {
      return Array.isArray(value) && value.length > 0;
    }
    return value != null && String(value) !== '';
  }

  getColumnValue(item: T, column: ColumnConfig<T>): string {
    if (column.getValue) {
      const value = column.getValue(item);
      return value != null ? String(value) : '';
    }
    console.warn(`Column '${column.key}' has no getValue function and no template`);
    return '';
  }

  getImageUrl(item: T): string {
    const getter = this.imageUrlGetter();
    if (getter) {
      const url = getter(item);
      return url || '';
    }
    return '';
  }
}
