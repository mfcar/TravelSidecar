import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ts-create-update-user',
  imports: [],
  templateUrl: './create-update-user.modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateUpdateUserModal {}
