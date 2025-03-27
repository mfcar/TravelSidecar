import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'ts-page-header-information',
  imports: [FontAwesomeModule],
  templateUrl: './page-header-information.component.html',
  styleUrl: './page-header-information.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderInformationComponent {
  icon = input<string>();
  text = input.required<string>();
}
