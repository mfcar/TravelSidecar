import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CreateUpdateActivityRequest, JourneyActivity } from '../../../models/activities.model';
import { JourneyActivityService } from '../../../services/journey-activity.service';
import { ToastService } from '../../../services/toast.service';
import {
  ActivityFormComponent,
  ActivityFormData,
} from '../../activities/activity-form/activity-form.component';

export interface ActivityModalData {
  journeyId: string;
  activity?: JourneyActivity;
  selectedDay?: Date | number;
  mode: 'create' | 'edit';
}

@Component({
  selector: 'ts-activity-modal',
  imports: [FontAwesomeModule, ActivityFormComponent],
  template: `
    <div class="bg-white dark:bg-gray-900 rounded-lg shadow-xl">
      <!-- Header -->
      <div
        class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700"
      >
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {{ data.mode === 'create' ? 'Add New Activity' : 'Edit Activity' }}
        </h2>
        <button
          class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
          type="button"
          (click)="close()"
        >
          <fa-icon class="h-5 w-5" [icon]="['fas', 'times']" />
        </button>
      </div>

      <!-- Body -->
      <div class="p-6">
        <ts-activity-form [data]="formData" (save)="onSubmit($event)" (cancelled)="close()" />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityModalComponent {
  private dialogRef = inject<DialogRef<JourneyActivity>>(DialogRef);
  private journeyActivityService = inject(JourneyActivityService);
  private toastService = inject(ToastService);

  data = inject<ActivityModalData>(DIALOG_DATA);

  formData: ActivityFormData = {
    activity: this.data.activity,
    journeyId: this.data.journeyId,
    dayNumber: typeof this.data.selectedDay === 'number' ? this.data.selectedDay : undefined,
  };

  onSubmit(formData: CreateUpdateActivityRequest): void {
    if (this.data.mode === 'create') {
      this.createActivity(formData);
    } else {
      this.updateActivity(formData);
    }
  }

  private createActivity(formData: CreateUpdateActivityRequest): void {
    this.journeyActivityService.createActivity(this.data.journeyId, formData).subscribe({
      next: (activity) => {
        this.toastService.showSuccess('Activity created successfully');
        this.dialogRef.close(activity);
      },
      error: (error) => {
        console.error('Error creating activity:', error);
        this.toastService.showError('Failed to create activity. Please try again.');
      },
    });
  }

  private updateActivity(formData: CreateUpdateActivityRequest): void {
    if (!this.data.activity?.id) return;

    this.journeyActivityService
      .updateActivity(this.data.journeyId, this.data.activity.id, formData)
      .subscribe({
        next: (activity) => {
          this.toastService.showSuccess('Activity updated successfully');
          this.dialogRef.close(activity);
        },
        error: (error) => {
          console.error('Error updating activity:', error);
          this.toastService.showError('Failed to update activity. Please try again.');
        },
      });
  }

  close(): void {
    this.dialogRef.close();
  }
}
