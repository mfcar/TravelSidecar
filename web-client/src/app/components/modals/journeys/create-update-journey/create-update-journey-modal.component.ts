import { Dialog, DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { JourneyCategory } from '../../../../models/journey-categories.model';
import { CreateUpdateJourneyRequest, Journey } from '../../../../models/journeys.model';
import { JourneyCategoryService } from '../../../../services/journey-category.service';
import { JourneyService } from '../../../../services/journey.service';
import { ToastService, ToastType } from '../../../../services/toast.service';
import { ButtonComponent } from '../../../buttons/button/button.component';
import { DateOnlyInputComponent } from '../../../forms/date-only-input/date-only-input.component';
import { GenericSelectorInputComponent } from '../../../forms/generic-selector-input/generic-selector-input.component';
import { TagsSelectorInputComponent } from '../../../forms/tags-selector-input/tags-selector-input.component';
import { TextInputComponent } from '../../../forms/text-input/text-input.component';
import { TextareaInputComponent } from '../../../forms/textarea-input/textarea-input.component';
import { AlertComponent } from '../../../ui/alert/alert.component';
import { BaseModalComponent } from '../../base-modal/base-modal.component';
import { CreateUpdateJourneyCategoryModal } from '../../journeyCategories/create-update-journey-category/create-update-journey-category-modal.component';

@Component({
  selector: 'ts-create-update-journey',
  imports: [
    TextInputComponent,
    ReactiveFormsModule,
    ButtonComponent,
    TextareaInputComponent,
    AlertComponent,
    TagsSelectorInputComponent,
    BaseModalComponent,
    GenericSelectorInputComponent,
    DateOnlyInputComponent,
  ],
  templateUrl: './create-update-journey-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateUpdateJourneyModal implements OnInit {
  private fb = inject(FormBuilder);
  private journeyService = inject(JourneyService);
  private toastsService = inject(ToastService);
  private dialogRef = inject(DialogRef);
  private dialogData = inject(DIALOG_DATA);
  public errorMessage = signal<string | null>(null);
  public isLoading = signal<boolean>(false);
  private journeyCategoryService = inject(JourneyCategoryService);
  private dialog = inject(Dialog);
  categories = signal<JourneyCategory[]>([]);
  minEndDate = signal<string | null>(null);
  maxStartDate = signal<string | null>(null);

  form: FormGroup;
  isUpdateMode = false;
  journey: Journey | null = null;

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(120)]],
      description: [''],
      categoryId: [''],
      startDate: [null],
      endDate: [null],
      tagIds: [[]],
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

    this.loadCategories();
  }

  ngOnInit(): void {
    if (this.dialogData && this.dialogData.journey) {
      this.isUpdateMode = true;
      this.journey = this.dialogData.journey;

      if (this.journey) {
        const startDate = this.journey.startDate
          ? new Date(this.journey.startDate).toISOString().split('T')[0]
          : null;
        const endDate = this.journey.endDate
          ? new Date(this.journey.endDate).toISOString().split('T')[0]
          : null;

        this.form.patchValue({
          name: this.journey.name,
          description: this.journey.description,
          categoryId: this.journey.categoryId,
          startDate: startDate,
          endDate: endDate,
        });

        if (this.journey.tags && Array.isArray(this.journey.tags)) {
          this.form.patchValue({
            tagIds: this.journey.tags.map((tag) => tag.id),
          });
        }
      }
    }
  }

  private loadCategories(): void {
    this.journeyCategoryService
      .getJourneyCategories({
        page: 1,
        pageSize: 1000,
        sortBy: 'name',
        sortOrder: 'asc',
      })
      .subscribe((response) => {
        this.categories.set(response.items || []);
      });
  }

  onSubmit() {
    if (this.form.valid) {
      this.isLoading.set(true);

      const formValue = this.form.value;

      const request: CreateUpdateJourneyRequest = {
        name: formValue.name,
        description: formValue.description,
        categoryId: formValue.categoryId || undefined,
        tagIds: formValue.tagIds || [],
        startDate: formValue.startDate || null,
        endDate: formValue.endDate || null,
      };

      if (request.startDate === undefined) {
        request.startDate = null;
      }
      if (request.endDate === undefined) {
        request.endDate = null;
      }

      if (this.isUpdateMode && this.journey) {
        this.journeyService.updateJourney(this.journey.id, request).subscribe({
          next: () => {
            this.dialogRef.close(true);
            this.toastsService.show({
              message: 'Journey updated successfully',
              type: ToastType.SUCCESS,
            });
          },
          error: (error) => {
            console.error('Error updating journey', error);
            this.toastsService.show({
              message: 'Error updating journey',
              type: ToastType.ERROR,
            });
            this.errorMessage.set('Error updating journey: ' + error.message);
            this.isLoading.set(false);
          },
        });
      } else {
        this.journeyService.createJourney(request).subscribe({
          next: (response) => {
            this.dialogRef.close(response);
            this.toastsService.show({
              message: 'Journey created successfully',
              type: ToastType.SUCCESS,
            });
          },
          error: (error) => {
            console.error('Error creating journey', error);
            this.toastsService.show({
              message: 'Error creating journey',
              type: ToastType.ERROR,
            });
            this.errorMessage.set('Error creating journey: ' + error.message);
            this.isLoading.set(false);
          },
        });
      }
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  showCreateCategoryModal(): void {
    const modalRef = this.dialog.open(CreateUpdateJourneyCategoryModal, {
      width: '500px',
    });

    modalRef.closed.subscribe((result) => {
      const category = result as JourneyCategory;
      if (category) {
        this.categories.set([...this.categories(), category]);

        this.form.patchValue({ categoryId: category.id });
      }
    });
  }
}
