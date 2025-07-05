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
  columns = input<ColumnConfig[]>([]);
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

  getCellTemplate(column: ColumnConfig): TemplateRef<unknown> | null {
    return column.gridLabelTemplate || column.stackLabelTemplate || column.cellTemplate || null;
  }

  hasValue(item: T, key: string): boolean {
    // Type-safe property access for dynamic keys
    const value = this.getItemProperty(item, key);
    if (key === 'tags') {
      return Array.isArray(value) && value.length > 0;
    }
    return value !== null && value !== undefined && value !== '';
  }

  private getItemProperty(item: T, key: string): unknown {
    // Safe property access with proper typing
    return (item as Record<string, unknown>)[key];
  }
}
