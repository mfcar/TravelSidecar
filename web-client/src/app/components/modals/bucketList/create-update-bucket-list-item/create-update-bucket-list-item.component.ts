import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  BucketListItem,
  BucketListItemType,
  CreateUpdateBucketListItemRequest,
} from '../../../../models/bucket-list.model';
import { Tag } from '../../../../models/tags.model';
import { BucketListService } from '../../../../services/bucket-list.service';
import { FileService } from '../../../../services/file.service';
import { TagService } from '../../../../services/tag.service';
import { ToastService, ToastType } from '../../../../services/toast.service';
import { ButtonComponent } from '../../../buttons/button/button.component';
import { CurrencyPriceInputComponent } from '../../../forms/currency-price-input/currency-price-input.component';
import { DateOnlyInputComponent } from '../../../forms/date-only-input/date-only-input.component';
import { TagsSelectorInputComponent } from '../../../forms/tags-selector-input/tags-selector-input.component';
import { TextInputComponent } from '../../../forms/text-input/text-input.component';
import { TextareaInputComponent } from '../../../forms/textarea-input/textarea-input.component';
import { AlertComponent } from '../../../ui/alert/alert.component';
import { BaseModalComponent } from '../../base-modal/base-modal.component';

@Component({
  selector: 'ts-create-update-bucket-list-item',
  imports: [
    BaseModalComponent,
    AlertComponent,
    TextInputComponent,
    TextareaInputComponent,
    ReactiveFormsModule,
    ButtonComponent,
    TagsSelectorInputComponent,
    DateOnlyInputComponent,
    CurrencyPriceInputComponent,
  ],
  templateUrl: './create-update-bucket-list-item.component.html',
  styleUrl: './create-update-bucket-list-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateUpdateBucketListItemComponent implements OnInit {
  private fb = inject(FormBuilder);
  private bucketListService = inject(BucketListService);
  private fileService = inject(FileService);
  private tagService = inject(TagService);
  private toastService = inject(ToastService);
  private dialogRef = inject(DialogRef);
  private dialogData = inject(DIALOG_DATA);

  // State signals
  errorMessage = signal<string | null>(null);
  isLoading = signal<boolean>(false);
  // bucketLists = signal<BucketList[]>([]);
  tags = signal<Tag[]>([]);
  selectedFile = signal<File | null>(null);
  minEndDate = signal<string | null>(null);
  maxStartDate = signal<string | null>(null);

  // Form
  form: FormGroup;
  isUpdateMode = false;
  bucketListItem: BucketListItem | null = null;

  // Options for dropdowns
  typeOptions = [
    { label: 'Destination', value: BucketListItemType.Destination },
    { label: 'Activity', value: BucketListItemType.Activity },
    { label: 'Accommodation', value: BucketListItemType.Accommodation },
    { label: 'Food', value: BucketListItemType.Food },
    { label: 'Transportation', value: BucketListItemType.Transportation },
    { label: 'Event', value: BucketListItemType.Event },
    { label: 'Other', value: BucketListItemType.Other },
  ];

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', Validators.maxLength(500)],
      type: [BucketListItemType.Destination, Validators.required],
      bucketListId: [null],
      startDate: [null],
      startTime: [null],
      startTimeZoneId: ['UTC'],
      endDate: [null],
      endTime: [null],
      endTimeZoneId: ['UTC'],
      price: [{ price: null, currencyCode: 'USD' }],
      tagIds: [[]],
    });

    this.form.get('startTime')?.valueChanges.subscribe((time) => {
      const startTimeZoneControl = this.form.get('startTimeZoneId');
      if (time) {
        startTimeZoneControl?.setValidators([Validators.required]);
      } else {
        startTimeZoneControl?.clearValidators();
      }
      startTimeZoneControl?.updateValueAndValidity();
    });

    this.form.get('endTime')?.valueChanges.subscribe((time) => {
      const endTimeZoneControl = this.form.get('endTimeZoneId');
      if (time) {
        endTimeZoneControl?.setValidators([Validators.required]);
      } else {
        endTimeZoneControl?.clearValidators();
      }
      endTimeZoneControl?.updateValueAndValidity();
    });

    this.form.get('originalPrice')?.valueChanges.subscribe((price) => {
      const currencyControl = this.form.get('originalCurrencyCode');
      if (price) {
        currencyControl?.setValidators([Validators.required]);
      } else {
        currencyControl?.clearValidators();
      }
      currencyControl?.updateValueAndValidity();
    });

    this.form.get('startDate')?.valueChanges.subscribe((date) => {
      if (date) {
        this.minEndDate.set(date);
      } else {
        this.minEndDate.set(null);
      }
    });

    this.form.get('endDate')?.valueChanges.subscribe((date) => {
      if (date) {
        this.maxStartDate.set(date);
      } else {
        this.maxStartDate.set(null);
      }
    });
  }

  ngOnInit(): void {
    if (this.dialogData?.bucketListItem) {
      this.isUpdateMode = true;
      this.bucketListItem = this.dialogData.bucketListItem;
      this.patchFormValues();
    }
  }

  private patchFormValues(): void {
    if (!this.bucketListItem) return;

    this.form.patchValue({
      name: this.bucketListItem.name,
      description: this.bucketListItem.description,
      type: this.bucketListItem.type,
      bucketListId: this.bucketListItem.bucketListId,
      startDate: this.bucketListItem.startDate,
      startTimeZoneId: this.bucketListItem.startTimeZoneId || 'UTC',
      endDate: this.bucketListItem.endDate,
      endTimeZoneId: this.bucketListItem.endTimeZoneId || 'UTC',
      price: {
        price: this.bucketListItem.originalPrice || null,
        currencyCode: this.bucketListItem.originalCurrencyCode || 'USD',
      },
      tagIds: this.bucketListItem.tags?.map((t) => t.id) || [],
    });

    if (this.bucketListItem.startTimeUtc) {
      const date = new Date(this.bucketListItem.startTimeUtc);
      this.form
        .get('startTime')
        ?.setValue(
          `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
        );
    }

    if (this.bucketListItem.endTimeUtc) {
      const date = new Date(this.bucketListItem.endTimeUtc);
      this.form
        .get('endTime')
        ?.setValue(
          `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
        );
    }
  }

  onFileSelected(file: File): void {
    this.selectedFile.set(file);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const request: CreateUpdateBucketListItemRequest = {
        name: this.form.value.name,
        type: this.form.value.type,
        description: this.form.value.description || undefined,
        bucketListId: this.form.value.bucketListId || undefined,
        startDate: this.form.value.startDate || undefined,
        startTime: this.form.value.startTime || undefined,
        startTimeZoneId: this.form.value.startTime ? this.form.value.startTimeZoneId : undefined,
        endDate: this.form.value.endDate || undefined,
        endTime: this.form.value.endTime || undefined,
        endTimeZoneId: this.form.value.endTime ? this.form.value.endTimeZoneId : undefined,
        originalPrice: this.form.value.originalPrice || undefined,
        originalCurrencyCode: this.form.value.originalPrice
          ? this.form.value.originalCurrencyCode
          : undefined,
        tagIds: this.form.value.tagIds?.length > 0 ? this.form.value.tagIds : undefined,
      };

      if (this.isUpdateMode && this.bucketListItem) {
        this.bucketListService.updateBucketListItem(this.bucketListItem.id, request).subscribe({
          next: (response) => this.handleSuccess(response),
          error: (error) => this.handleError(error),
        });
      } else {
        this.bucketListService.createBucketListItem(request).subscribe({
          next: (response) => this.handleSuccess(response),
          error: (error) => this.handleError(error),
        });
      }
    } catch (error: any) {
      this.handleError(error);
    }
  }

  private handleSuccess(bucketListItem: BucketListItem): void {
    const file = this.selectedFile();
    if (file) {
      this.fileService.uploadBucketListItemImage(bucketListItem.id, file).subscribe({
        next: () => {
          this.completeOperation(bucketListItem);
        },
        error: (error) => {
          console.error('Error uploading file', error);
          this.toastService.show({
            message: 'Item saved but file upload failed',
            type: ToastType.WARN,
          });
          this.completeOperation(bucketListItem);
        },
      });
    } else {
      this.completeOperation(bucketListItem);
    }
  }

  private completeOperation(bucketListItem: BucketListItem): void {
    this.toastService.show({
      message: this.isUpdateMode
        ? 'Bucket list item updated successfully'
        : 'Bucket list item created successfully',
      type: ToastType.SUCCESS,
    });
    this.isLoading.set(false);
    this.dialogRef.close(bucketListItem);
  }

  private handleError(error: any): void {
    console.error('Error saving bucket list item', error);
    this.errorMessage.set(`Error saving bucket list item: ${error.message || error}`);
    this.toastService.show({
      message: 'Error saving bucket list item',
      type: ToastType.ERROR,
    });
    this.isLoading.set(false);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
