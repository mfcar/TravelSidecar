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
export class GridListViewMode<T extends Record<string, any>> {
  items = input<T[]>([]);
  columns = input<ColumnConfig<T>[]>([]);
  selectedFields = input.required<Set<string>>();
  hasImage = input<boolean>(false);
  placeholderImage = input<string | undefined | null>(null);

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

  getCellTemplate(column: ColumnConfig<T>, item: T): TemplateRef<any> | null {
    return column.gridLabelTemplate || column.stackLabelTemplate || column.cellTemplate || null;
  }

  hasValue(item: T, key: string): boolean {
    if (key === 'tags') {
      return Array.isArray(item[key]) && item[key].length > 0;
    }
    return item[key] !== null && item[key] !== undefined && item[key] !== '';
  }
}
