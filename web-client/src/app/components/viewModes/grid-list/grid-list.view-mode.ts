import { CommonModule } from '@angular/common';
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
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './grid-list.view-mode.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridListViewMode<T extends Record<string, any>> {
  items = input<T[]>([]);
  columns = input<ColumnConfig<T>[]>([]);
  selectedFields = input.required<Set<string>>();

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

  secondaryField = computed(() => {
    let foundFirst = false;
    for (const column of this.columns()) {
      if (this.selectedFields().has(column.key)) {
        if (foundFirst) {
          return column.key;
        }
        foundFirst = true;
      }
    }
    return '';
  });

  onEditButtonClicked(item: T): void {
    this.editButtonClicked.emit(item);
  }

  getCellTemplate(column: ColumnConfig<T>, item: T): TemplateRef<any> | null {
    return column.gridLabelTemplate || column.cellTemplate || null;
  }

  isMainField(key: string): boolean {
    return key === this.primaryField() || key === this.secondaryField();
  }

  getDateField(): string | undefined {
    const dateCandidates = ['startDate', 'endDate', 'createdAt', 'lastModifiedAt'];
    for (const candidate of dateCandidates) {
      if (this.selectedFields().has(candidate)) {
        return candidate;
      }
    }
    return undefined;
  }
}
