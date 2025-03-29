import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ts-not-found',
  imports: [],
  templateUrl: './not-found.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPage {}
