import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { JourneyCategory } from '../../../../models/journey-categories.model';
import { CreateUpdateJourneyRequest } from '../../../../models/journeys.model';
import { JourneyCategoryService } from '../../../../services/journey-category.service';
import { ToastService, ToastType } from '../../../../services/toast.service';
import { ButtonComponent } from '../../../buttons/button/button.component';
import { TextInputComponent } from '../../../forms/text-input/text-input.component';
import { TextareaInputComponent } from '../../../forms/textarea-input/textarea-input.component';
import { AlertComponent } from '../../../ui/alert/alert.component';
import { BaseModalComponent } from '../../base-modal/base-modal.component';

@Component({
  selector: 'ts-create-update-journey-category',
  imports: [
    TextInputComponent,
    ReactiveFormsModule,
    ButtonComponent,
    TextareaInputComponent,
    BaseModalComponent,
    AlertComponent,
  ],
  templateUrl: './create-update-journey-category-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateUpdateJourneyCategoryModal implements OnInit {
  private fb = inject(FormBuilder);
  private journeyCategoryService = inject(JourneyCategoryService);
  private toastsService = inject(ToastService);
  private dialogRef = inject(DialogRef);
  private dialogData = inject(DIALOG_DATA);
  public errorMessage = signal<string | null>(null);
  public isLoading = signal<boolean>(false);

  form: FormGroup;
  isUpdateMode = false;
  journeyCategory: JourneyCategory | null = null;

  constructor() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
    });
  }

  ngOnInit(): void {
    if (this.dialogData && this.dialogData.journeyCategory) {
      this.isUpdateMode = true;
      this.journeyCategory = this.dialogData.journeyCategory;
      if (this.journeyCategory) {
        this.form.patchValue(this.journeyCategory);
      }
    }
  }

  onSubmit() {
    if (this.form.valid) {
      this.isLoading.set(true);
      const request: CreateUpdateJourneyRequest = this.form.value;

      if (this.isUpdateMode && this.journeyCategory) {
        this.journeyCategoryService
          .updateJourneyCategory(this.journeyCategory.id, request)
          .subscribe({
            next: (response) => {
              this.dialogRef.close(response);
              this.toastsService.show({
                message: 'Journey category updated',
                type: ToastType.SUCCESS,
              });
            },
            error: (error) => {
              console.error('Error updating journey category', error);
              this.toastsService.show({
                message: 'Error updating journey category',
                type: ToastType.ERROR,
              });
              this.errorMessage.set('Error updating journey category: ' + error.message);
              this.isLoading.set(false);
            },
          });
      } else {
        this.journeyCategoryService.createJourneyCategory(request).subscribe({
          next: (response) => {
            this.dialogRef.close(response);
            this.toastsService.show({
              message: 'Journey category created',
              type: ToastType.SUCCESS,
            });
          },
          error: (error) => {
            console.error('Error creating journey category', error);
            this.toastsService.show({
              message: 'Error creating journey category',
              type: ToastType.ERROR,
            });
            this.errorMessage.set('Error creating journey category: ' + error.message);
            this.isLoading.set(false);
          },
        });
      }
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
