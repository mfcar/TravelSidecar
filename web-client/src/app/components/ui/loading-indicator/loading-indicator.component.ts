import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'ts-loading-indicator',
  imports: [FontAwesomeModule],
  template: ` <fa-icon [icon]="['fas', 'spinner']" animation="spin" [fixedWidth]="true" /> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingIndicatorComponent {}
