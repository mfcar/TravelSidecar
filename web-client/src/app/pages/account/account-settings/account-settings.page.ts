import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ts-account-settings',
  imports: [],
  templateUrl: './account-settings.page.html',
  styleUrl: './account-settings.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountSettingsPage {}
