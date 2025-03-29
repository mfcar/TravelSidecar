import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'ts-base-modal',
  imports: [FontAwesomeModule, ScrollingModule],
  template: `
    <div
      class="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-900 shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md max-h-[90vh]"
    >
      <div class="bg-gray-50 dark:bg-gray-800 px-4 sm:px-6 h-14 flex justify-between items-center">
        @if (modalTitle()) {
          <h3
            class="text-base font-semibold leading-6 text-gray-900 dark:text-white pr-8"
            id="modal-title"
          >
            {{ modalTitle() }}
          </h3>
        } @else {
          <div></div>
        }
        <button
          class="rounded-full py-1 px-2 text-gray-400 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500 flex-shrink-0"
          type="button"
          (click)="close()"
        >
          <span class="sr-only">Close</span>
          <fa-icon class="h-5 w-5" [icon]="['fas', 'xmark']" [fixedWidth]="true" />
        </button>
      </div>
      <div
        class="border-t border-b border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6 sm:py-6 overflow-y-auto"
        style="max-height: calc(90vh - 112px);"
        cdkScrollable
      >
        <ng-content select="[modal-body]" />
      </div>
      <div class="bg-gray-50 dark:bg-gray-800 px-4 sm:px-6 h-14 flex flex-row-reverse items-center">
        <ng-content select="[modal-footer]" />
      </div>
    </div>
  `,
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
