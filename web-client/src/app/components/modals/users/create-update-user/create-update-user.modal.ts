import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ts-create-update-user',
  imports: [],
  templateUrl: './create-update-user.modal.html',
  styleUrl: './create-update-user.modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateUpdateUserModal {}
