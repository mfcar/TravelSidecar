import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateUpdateTagRequest, TagResponse } from '../../../../models/tags.model';
import { TagService } from '../../../../services/tag.service';
import { ToastService, ToastType } from '../../../../services/toast.service';
import { ButtonComponent } from '../../../buttons/button/button.component';
import { TextInputComponent } from '../../../forms/text-input/text-input.component';

import { ColorSelectorInputComponent } from '../../../forms/color-selector-input/color-selector-input.component';
import { AlertComponent } from '../../../ui/alert/alert.component';
import { BaseModalComponent } from '../../base-modal/base-modal.component';

@Component({
  selector: 'ts-create-update-tag',
  imports: [
    TextInputComponent,
    ReactiveFormsModule,
    ButtonComponent,
    BaseModalComponent,
    AlertComponent,
    ColorSelectorInputComponent,
  ],
  templateUrl: './create-update-tag.modal.html',
  styleUrl: './create-update-tag.modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateUpdateTagModal implements OnInit {
  private fb = inject(FormBuilder);
  private tagService = inject(TagService);
  private toastsService = inject(ToastService);
  private dialogRef = inject(DialogRef);
  private dialogData = inject(DIALOG_DATA);

  public errorMessage = signal<string | null>(null);
  public isLoading = signal<boolean>(false);

  form: FormGroup;
  isUpdateMode = false;
  tag: TagResponse | null = null;

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      color: ['', [Validators.required, Validators.maxLength(10)]],
    });
  }

  ngOnInit(): void {
    if (this.dialogData && this.dialogData.tag) {
      this.isUpdateMode = true;
      this.tag = this.dialogData.tag;
      if (this.tag) {
        this.form.patchValue(this.tag);
      }
    }
  }

  onSubmit() {
    if (this.form.valid) {
      this.isLoading.set(true);
      const request: CreateUpdateTagRequest = this.form.value;

      if (this.isUpdateMode && this.tag) {
        this.tagService.updateTag(this.tag.id, request).subscribe({
          next: (response) => {
            this.dialogRef.close(response);
            this.toastsService.show({
              message: 'Tag updated successfully',
              type: ToastType.SUCCESS,
            });
          },
          error: (error) => {
            console.error('Error updating tag', error);
            this.toastsService.show({
              message: 'Error updating tag',
              type: ToastType.ERROR,
            });
            this.errorMessage.set('Error updating tag: ' + error.message);
            this.isLoading.set(false);
          },
        });
      } else {
        this.tagService.createTag(request).subscribe({
          next: (response) => {
            this.dialogRef.close(response);
            this.toastsService.show({
              message: 'Tag created successfully',
              type: ToastType.SUCCESS,
            });
          },
          error: (error) => {
            console.error('Error creating tag', error);
            this.toastsService.show({
              message: 'Error creating tag',
              type: ToastType.ERROR,
            });
            this.errorMessage.set('Error creating tag: ' + error.message);
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
