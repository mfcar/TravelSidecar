import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ts-application-versions',
  imports: [],
  templateUrl: './application-versions.page.html',
  styleUrl: './application-versions.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationVersionsPage {}
