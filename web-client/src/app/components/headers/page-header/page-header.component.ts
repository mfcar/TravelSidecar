import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ts-page-header',
  imports: [],
  templateUrl: './page-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  title = input.required<string>();
  showBreadcrumb = input<boolean>(false);
}
