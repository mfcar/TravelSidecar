import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output, TemplateRef } from '@angular/core';
import { ButtonComponent } from '../../buttons/button/button.component';
import { ColumnConfig } from '../table-list/table-list.view-mode';

@Component({
  selector: 'ts-stack-list',
  imports: [CommonModule, ButtonComponent],
  templateUrl: './stack-list.view-mode.html',
  styleUrl: './stack-list.view-mode.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StackListViewMode<T extends Record<string, any>> {
  items = input<T[]>([]);
  columns = input<ColumnConfig<T>[]>([]);
  selectedFields = input.required<Set<string>>();

  editButtonClicked = output<T>();
  deleteButtonClicked = output<T>();

  onEditButtonClicked(item: T): void {
    this.editButtonClicked.emit(item);
  }

  onDeleteButtonClicked(item: T): void {
    this.deleteButtonClicked.emit(item);
  }

  getCellTemplate(column: ColumnConfig<T>, item: T): TemplateRef<any> | null {
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
}
