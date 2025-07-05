import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output, TemplateRef } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ButtonComponent } from '../../buttons/button/button.component';
import { ColumnConfig } from '../table-list/table-list.view-mode';

@Component({
  selector: 'ts-stack-list',
  imports: [CommonModule, ButtonComponent, NgOptimizedImage, FontAwesomeModule],
  templateUrl: './stack-list.view-mode.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StackListViewMode<T> {
  items = input<T[]>([]);
  columns = input<ColumnConfig<T>[]>([]);
  selectedFields = input.required<Set<string>>();
  hasImage = input<boolean>(false);
  placeholderImage = input<string | undefined | null>(null);
  imageUrlGetter = input<((item: T) => string | null | undefined) | undefined>();

  editButtonClicked = output<T>();
  deleteButtonClicked = output<T>();

  onEditButtonClicked(item: T): void {
    this.editButtonClicked.emit(item);
  }

  onDeleteButtonClicked(item: T): void {
    this.deleteButtonClicked.emit(item);
  }

  getCellTemplate(column: ColumnConfig<T>): TemplateRef<{ $implicit: T }> | null {
    return column.stackLabelTemplate || column.gridLabelTemplate || column.cellTemplate || null;
  }

  get firstSelectedKey(): string | undefined {
    const cols = this.columns();
    for (const col of cols) {
      if (this.selectedFields().has(col.key)) {
        return col.key;
      }
    }
    return undefined;
  }

  hasValue(item: T, column: ColumnConfig<T>): boolean {
    if (!column.getValue) {
      return false;
    }
    const value = column.getValue(item);
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
