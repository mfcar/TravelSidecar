import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'ts-base-modal',
  imports: [FontAwesomeModule, ScrollingModule],
  templateUrl: './base-modal.component.html',
  styleUrl: './base-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseModalComponent {
  modalTitle = input<string | null>(null);
  dialogRef = inject(DialogRef);
  dialogData = inject(DIALOG_DATA, { optional: true });

  close(): void {
    this.dialogRef?.close();
  }
}
