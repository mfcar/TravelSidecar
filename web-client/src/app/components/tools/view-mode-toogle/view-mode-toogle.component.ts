import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ListViewMode } from '../../../models/enums/list-view-mode.enum';

interface ModeMapping {
  icon: string;
  label: string;
}

const DEFAULT_VIEW_MODES: ListViewMode[] = [
  ListViewMode.Grid,
  ListViewMode.Table,
  ListViewMode.Stack,
];

const MODE_MAPPING: Record<ListViewMode, ModeMapping> = {
  [ListViewMode.Grid]: { icon: 'grip', label: 'Grid' },
  [ListViewMode.Table]: { icon: 'table', label: 'Table' },
  [ListViewMode.Stack]: { icon: 'list', label: 'Stack' },
};

@Component({
  selector: 'ts-view-mode-toogle',
  imports: [FontAwesomeModule, NgClass],
  templateUrl: './view-mode-toogle.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewModeToogleComponent {
  viewModes = input<ListViewMode[]>(DEFAULT_VIEW_MODES);
  selectedViewMode = input<ListViewMode>(ListViewMode.Table);
  viewModeChange = output<ListViewMode>();

  readonly DEFAULT_VIEW_MODES = DEFAULT_VIEW_MODES;
  readonly MODE_MAPPING = MODE_MAPPING;

  get orderedViewModes(): ListViewMode[] {
    return this.DEFAULT_VIEW_MODES.filter((mode) => this.viewModes().includes(mode));
  }

  onViewModeChange(newMode: ListViewMode) {
    this.viewModeChange.emit(newMode);
  }

  getAriaLabel(mode: ListViewMode): string {
    switch (mode) {
      case ListViewMode.Grid:
        return $localize`:@@viewModeGridAriaLabel:Switch to grid view`;
      case ListViewMode.Table:
        return $localize`:@@viewModeTableAriaLabel:Switch to table view`;
      case ListViewMode.Stack:
        return $localize`:@@viewModeStackAriaLabel:Switch to stack view`;
      default:
        return '';
    }
  }

  getLocalizedLabel(mode: ListViewMode): string {
    switch (mode) {
      case ListViewMode.Grid:
        return $localize`:@@viewModeGridLabel:Grid`;
      case ListViewMode.Table:
        return $localize`:@@viewModeTableLabel:Table`;
      case ListViewMode.Stack:
        return $localize`:@@viewModeStackLabel:Stack`;
      default:
        return '';
    }
  }
}
