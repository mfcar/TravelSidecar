import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Journey } from '../../../../models/journeys.model';
import { JourneyService } from '../../../../services/journey.service';
import { ToastService, ToastType } from '../../../../services/toast.service';
import { ButtonComponent } from '../../../buttons/button/button.component';
import { AlertComponent } from '../../../ui/alert/alert.component';
import { BaseModalComponent } from '../../base-modal/base-modal.component';

interface JourneyImageUploadData {
  journey: Journey;
}

@Component({
  selector: 'ts-upload-delete-journey-cover',
  imports: [
    NgClass,
    FontAwesomeModule,
    FormsModule,
    ButtonComponent,
    BaseModalComponent,
    AlertComponent,
  ],
  templateUrl: './upload-delete-journey-cover.modal.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadDeleteJourneyCoverModal {
  private journeyService = inject(JourneyService);
  private toastService = inject(ToastService);
  private dialogRef = inject(DialogRef);
  private dialogData = inject<JourneyImageUploadData>(DIALOG_DATA);

  journey = this.dialogData.journey;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  isDragOver = signal(false);
  isDeletingImage = signal(false);

  maxSizeInMB = 2;
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

  constructor() {
    if (this.journey.bannerImage) {
      this.previewUrl.set(this.journey.bannerImage);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.handleFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    if (event.dataTransfer?.files?.length) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  handleFile(file: File): void {
    if (!this.allowedTypes.includes(file.type)) {
      this.errorMessage.set(`Invalid file type. Only ${this.allowedTypes.join(', ')} are allowed.`);
      return;
    }

    if (file.size > this.maxSizeInMB * 1024 * 1024) {
      this.errorMessage.set(`File size exceeds ${this.maxSizeInMB}MB limit.`);
      return;
    }

    this.errorMessage.set(null);

    this.selectedFile.set(file);

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.previewUrl.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  uploadImage(): void {
    const file = this.selectedFile();
    if (!file) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.journeyService.uploadJourneyImage(this.journey.id, file).subscribe({
      next: (response) => {
        this.toastService.show({
          message: 'Journey image updated successfully',
          type: ToastType.SUCCESS,
        });
        this.isLoading.set(false);
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error uploading image:', error);
        this.errorMessage.set(`Failed to upload image: ${error.message || 'Unknown error'}`);
        this.isLoading.set(false);
      },
    });
  }

  deleteImage(): void {
    if (!this.journey.coverImageId) {
      return;
    }

    this.isDeletingImage.set(true);
    this.errorMessage.set(null);

    this.journeyService.deleteJourneyImage(this.journey.id, this.journey.coverImageId).subscribe({
      next: () => {
        this.toastService.show({
          message: 'Journey image removed successfully',
          type: ToastType.SUCCESS,
        });
        this.isDeletingImage.set(false);
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error deleting image:', error);
        this.errorMessage.set(`Failed to delete image: ${error.message || 'Unknown error'}`);
        this.isDeletingImage.set(false);
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
