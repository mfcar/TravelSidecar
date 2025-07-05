import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  EventEmitter,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ActivityType,
  CreateUpdateActivityRequest,
  JourneyActivity,
} from '../../../models/activities.model';
import { Tag } from '../../../models/tags.model';
import { TagService } from '../../../services/tag.service';
import { TimezoneService } from '../../../services/timezone.service';
import { ActivityTypeUtils } from '../../../utils/activity-type.utils';
import { ButtonComponent } from '../../buttons/button/button.component';
import { CurrencyPriceInputComponent } from '../../forms/currency-price-input/currency-price-input.component';
import { DateOnlyInputComponent } from '../../forms/date-only-input/date-only-input.component';
import { GenericSelectorInputComponent } from '../../forms/generic-selector-input/generic-selector-input.component';
import { TagsSelectorInputComponent } from '../../forms/tags-selector-input/tags-selector-input.component';
import { TextInputComponent } from '../../forms/text-input/text-input.component';
import { TextareaInputComponent } from '../../forms/textarea-input/textarea-input.component';
import { TimeOnlyInputComponent } from '../../forms/time-only-input/time-only-input.component';
import { TimezoneSelectorComponent } from '../../forms/timezone-selector/timezone-selector.component';
import { AlertComponent } from '../../ui/alert/alert.component';

export interface ActivityFormData {
  activity?: JourneyActivity;
  journeyId: string;
  dayNumber?: number;
}

@Component({
  selector: 'ts-activity-form',
  imports: [
    ReactiveFormsModule,
    AlertComponent,
    TextInputComponent,
    TextareaInputComponent,
    DateOnlyInputComponent,
    TimeOnlyInputComponent,
    TimezoneSelectorComponent,
    GenericSelectorInputComponent,
    CurrencyPriceInputComponent,
    TagsSelectorInputComponent,
    ButtonComponent,
  ],
  templateUrl: './activity-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityFormComponent implements OnInit {
  // Inputs
  data = input.required<ActivityFormData>();
  isLoading = input<boolean>(false);
  errorMessage = input<string | null>(null);

  // Outputs
  save = output<CreateUpdateActivityRequest>();
  cancel = output<void>();

  // Services
  private fb = inject(FormBuilder);
  private tagService = inject(TagService);
  private timezoneService = inject(TimezoneService);

  // Form
  form!: FormGroup;
  isUpdateMode = signal(false);

  // Data
  tags = signal<Tag[]>([]);
  activityTypes = computed(() => ActivityTypeUtils.getAllActivityTypes());
  groupedActivityTypes = computed(() => ActivityTypeUtils.getGroupedActivityTypes());

  // Dynamic field visibility
  showLocationFields = computed(() => {
    const type = this.form?.get('activityType')?.value as ActivityType;
    return ActivityTypeUtils.hasLocationFields(type);
  });

  showReservationCode = computed(() => {
    const type = this.form?.get('activityType')?.value as ActivityType;
    return ActivityTypeUtils.hasReservationCode(type);
  });

  showCheckInOutTimes = computed(() => {
    const type = this.form?.get('activityType')?.value as ActivityType;
    return [
      ActivityType.Hotel,
      ActivityType.Hostel,
      ActivityType.Vacation,
      ActivityType.Camping,
      ActivityType.Lodging,
    ].includes(type);
  });

  showFlightFields = computed(() => {
    const type = this.form?.get('activityType')?.value as ActivityType;
    return type === ActivityType.Flight;
  });

  showTransportFields = computed(() => {
    const type = this.form?.get('activityType')?.value as ActivityType;
    return [ActivityType.Train, ActivityType.Bus, ActivityType.Ferry, ActivityType.Cruise].includes(
      type,
    );
  });

  constructor() {
    // React to activity type changes
    effect(() => {
      const type = this.form?.get('activityType')?.value;
      if (type) {
        this.updateFieldValidators(type);
      }
    });
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadTags();
  }

  private initializeForm(): void {
    const activity = this.data().activity;
    this.isUpdateMode.set(!!activity);

    // Detect user's timezone as default
    const userTimezone = this.timezoneService.getUserTimezone();

    this.form = this.fb.group({
      // Basic fields
      name: [activity?.name || '', [Validators.required, Validators.maxLength(200)]],
      description: [activity?.description || '', Validators.maxLength(500)],
      activityType: [activity?.activityType || ActivityType.Other, Validators.required],
      dayNumber: [activity?.dayNumber || this.data().dayNumber],

      // Date/Time fields
      startDate: [this.extractDate(activity?.startDateTime)],
      startTime: [this.extractTime(activity?.startDateTime)],
      startTimezone: [activity?.startTimezone || userTimezone],
      endDate: [this.extractDate(activity?.endDateTime)],
      endTime: [this.extractTime(activity?.endDateTime)],
      endTimezone: [activity?.endTimezone || userTimezone],

      // Location fields
      startLocation: [activity?.startLocation || ''],
      endLocation: [activity?.endLocation || ''],
      address: [activity?.address || ''],

      // Contact & Cost
      phoneNumber: [activity?.phoneNumber || ''],
      website: [activity?.website || ''],
      cost: [{ price: activity?.cost || null, currencyCode: activity?.currencyCode || 'USD' }],

      // Notes
      notes: [activity?.notes || ''],

      // Type-specific fields
      flightNumber: [''],
      airline: [''],
      seatNumber: [''],
      seatClass: [''],
      reservationCode: [''],
      departureGate: [''],
      arrivalGate: [''],
      departureTerminal: [''],
      arrivalTerminal: [''],

      // Lodging specific
      roomNumber: [''],
      roomType: [''],
      checkInTime: [''],
      checkOutTime: [''],
      numberOfGuests: [null],

      // Transport specific
      routeName: [''],
      transportNumber: [''],
      company: [''],
      departureStation: [''],
      arrivalStation: [''],
      coachNumber: [''],
      trainType: [''],
      vehicleClass: [''],
    });

    // Load type-specific data if updating
    if (activity && activity.activityType) {
      this.loadTypeSpecificData(activity);
    }

    // Subscribe to activity type changes
    this.form.get('activityType')?.valueChanges.subscribe((type) => {
      this.updateFieldValidators(type);
    });
  }

  private loadTags(): void {
    this.tagService.getAllTags().subscribe((response) => {
      this.tags.set(response.items);
    });
  }

  private extractDate(dateTime?: string): string | null {
    if (!dateTime) return null;
    return dateTime.split('T')[0];
  }

  private extractTime(dateTime?: string): string | null {
    if (!dateTime) return null;
    const timePart = dateTime.split('T')[1];
    return timePart ? timePart.substring(0, 5) : null;
  }

  private loadTypeSpecificData(activity: JourneyActivity): void {
    // This would parse the type-specific data from the activity
    // For now, we'll leave it empty as the backend handles this
  }

  private updateFieldValidators(type: ActivityType): void {
    // Clear all optional validators first
    const optionalFields = [
      'startLocation',
      'endLocation',
      'flightNumber',
      'airline',
      'reservationCode',
      'roomNumber',
      'transportNumber',
      'company',
    ];

    optionalFields.forEach((field) => {
      this.form.get(field)?.clearValidators();
      this.form.get(field)?.updateValueAndValidity();
    });

    // Add validators based on type
    if (ActivityTypeUtils.hasLocationFields(type)) {
      this.form.get('startLocation')?.setValidators([Validators.required]);
      this.form.get('endLocation')?.setValidators([Validators.required]);
    }

    if (type === ActivityType.Flight) {
      this.form.get('flightNumber')?.setValidators([Validators.required]);
      this.form.get('airline')?.setValidators([Validators.required]);
    }

    // Update validity
    Object.keys(this.form.controls).forEach((key) => {
      this.form.get(key)?.updateValueAndValidity();
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;

    // Combine date and time
    let startDateTime: string | undefined;
    if (formValue.startDate && formValue.startTime) {
      startDateTime = `${formValue.startDate}T${formValue.startTime}:00`;
    } else if (formValue.startDate) {
      startDateTime = `${formValue.startDate}T00:00:00`;
    }

    let endDateTime: string | undefined;
    if (formValue.endDate && formValue.endTime) {
      endDateTime = `${formValue.endDate}T${formValue.endTime}:00`;
    } else if (formValue.endDate) {
      endDateTime = `${formValue.endDate}T00:00:00`;
    }

    // Build type-specific data
    const typeSpecificData = this.buildTypeSpecificData(formValue);

    const request: CreateUpdateActivityRequest = {
      name: formValue.name,
      description: formValue.description || undefined,
      activityType: formValue.activityType,
      startDateTime,
      startTimezone: formValue.startTimezone || undefined,
      endDateTime,
      endTimezone: formValue.endTimezone || undefined,
      dayNumber: formValue.dayNumber || undefined,
      startLocation: formValue.startLocation || undefined,
      endLocation: formValue.endLocation || undefined,
      address: formValue.address || undefined,
      phoneNumber: formValue.phoneNumber || undefined,
      website: formValue.website || undefined,
      cost: formValue.cost?.price || undefined,
      currencyCode: formValue.cost?.currencyCode || undefined,
      notes: formValue.notes || undefined,
      typeSpecificData: Object.keys(typeSpecificData).length > 0 ? typeSpecificData : undefined,
    };

    this.save.emit(request);
  }

  private buildTypeSpecificData(formValue: any): any {
    const data: any = {};

    switch (formValue.activityType) {
      case ActivityType.Flight:
        if (formValue.flightNumber) data.flightNumber = formValue.flightNumber;
        if (formValue.airline) data.airline = formValue.airline;
        if (formValue.seatNumber) data.seatNumber = formValue.seatNumber;
        if (formValue.seatClass) data.seatClass = formValue.seatClass;
        if (formValue.reservationCode) data.reservationCode = formValue.reservationCode;
        if (formValue.departureGate) data.departureGate = formValue.departureGate;
        if (formValue.arrivalGate) data.arrivalGate = formValue.arrivalGate;
        if (formValue.departureTerminal) data.departureTerminal = formValue.departureTerminal;
        if (formValue.arrivalTerminal) data.arrivalTerminal = formValue.arrivalTerminal;
        break;

      case ActivityType.Hotel:
      case ActivityType.Hostel:
      case ActivityType.Vacation:
      case ActivityType.Camping:
      case ActivityType.Lodging:
        if (formValue.reservationCode) data.reservationCode = formValue.reservationCode;
        if (formValue.roomNumber) data.roomNumber = formValue.roomNumber;
        if (formValue.roomType) data.roomType = formValue.roomType;
        if (formValue.checkInTime) data.checkInTime = formValue.checkInTime;
        if (formValue.checkOutTime) data.checkOutTime = formValue.checkOutTime;
        if (formValue.numberOfGuests) data.numberOfGuests = formValue.numberOfGuests;
        break;

      case ActivityType.Train:
      case ActivityType.Bus:
      case ActivityType.Ferry:
      case ActivityType.Cruise:
        if (formValue.routeName) data.routeName = formValue.routeName;
        if (formValue.transportNumber) data.transportNumber = formValue.transportNumber;
        if (formValue.company) data.company = formValue.company;
        if (formValue.departureStation) data.departureStation = formValue.departureStation;
        if (formValue.arrivalStation) data.arrivalStation = formValue.arrivalStation;
        if (formValue.reservationCode) data.reservationCode = formValue.reservationCode;
        if (formValue.seatNumber) data.seatNumber = formValue.seatNumber;
        if (formValue.seatClass) data.seatClass = formValue.seatClass;
        if (formValue.coachNumber) data.coachNumber = formValue.coachNumber;
        if (formValue.trainType) data.trainType = formValue.trainType;
        break;

      case ActivityType.Car:
        if (formValue.company) data.company = formValue.company;
        if (formValue.reservationCode) data.reservationCode = formValue.reservationCode;
        if (formValue.vehicleClass) data.vehicleClass = formValue.vehicleClass;
        break;
    }

    return data;
  }

  onCancel(): void {
    this.cancel.emit();
  }

  get modalTitle(): string {
    return this.isUpdateMode() ? 'Update Activity' : 'Create Activity';
  }
}