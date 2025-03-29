import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ts-grid-list',
  imports: [],
  templateUrl: './grid-list.view-mode.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridListViewMode {}
