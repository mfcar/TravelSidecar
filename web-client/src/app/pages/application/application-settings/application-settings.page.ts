import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ts-application-settings',
  imports: [],
  templateUrl: './application-settings.page.html',
  styleUrl: './application-settings.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationSettingsPage {}
