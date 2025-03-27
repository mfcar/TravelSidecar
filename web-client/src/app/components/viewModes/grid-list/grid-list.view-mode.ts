import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ts-grid-list',
  imports: [],
  templateUrl: './grid-list.view-mode.html',
  styleUrl: './grid-list.view-mode.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridListViewMode {}
