import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { ControlValueAccessor, FormsModule, NgControl } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { UserTimeFormat } from '../../../models/enums/user-preferences.enum';
import { PreferenceKeys, UserPreferencesService } from '../../../services/user-preferences.service';

@Component({
  selector: 'ts-time-only-input',
  imports: [FormsModule, FontAwesomeModule, NgClass],
  templateUrl: './time-only-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeOnlyInputComponent implements ControlValueAccessor {
  // Inputs
  label = input<string>();
  placeholder = input<string>('Select time');
  helpText = input<string>();
  tabIndex = input<number>(0);
  showRequiredIndicator = input<boolean>(false);

  // Services
  private ngControl = inject(NgControl);
  private userPreferencesService = inject(UserPreferencesService);

  // State
  inputValue = signal('');
  isDisabled = signal(false);

  // User preferences
  timeFormat = computed(() => {
    const format = this.userPreferencesService.getPreference(
      PreferenceKeys.TimeFormat,
      UserTimeFormat.HH_MM_24,
    ).value as UserTimeFormat;
    return format;
  });

  is24HourFormat = computed(() => {
    const format = this.timeFormat();
    return format === UserTimeFormat.HH_MM_24;
  });

  // Input type and step based on format
  inputType = computed(() => 'time');
  inputStep = computed(() => 60); // Always use 60 for minutes

  // ControlValueAccessor callbacks
  private onTouched?: () => void;
  private onChange?: (value: string) => void;

  // Unique IDs for accessibility
  private uniqueId = Math.random().toString(36).substring(2, 15);
  inputId = `time-input-${this.uniqueId}`;
  helpTextId = `time-help-${this.uniqueId}`;
  errorId = `time-error-${this.uniqueId}`;

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: string | null): void {
    if (value) {
      // Ensure the value is in HH:MM format for the time input
      const timeParts = value.split(':');
      if (timeParts.length >= 2) {
        this.inputValue.set(`${timeParts[0].padStart(2, '0')}:${timeParts[1].padStart(2, '0')}`);
      } else {
        this.inputValue.set('');
      }
    } else {
      this.inputValue.set('');
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  // Value change handler
  onInputChange(value: string): void {
    this.inputValue.set(value);
    this.onChange?.(value);
  }

  onInputBlur(): void {
    this.onTouched?.();
  }

  // Validation helpers
  get hasError(): boolean {
    return !!this.ngControl?.control?.invalid && !!this.ngControl?.control?.touched;
  }

  get errorMessage(): string {
    if (!this.ngControl?.control?.errors) return '';

    const errors = this.ngControl.control.errors;

    if (errors['required']) {
      return 'This field is required.';
    }

    return 'Invalid time format.';
  }

  get isRequired(): boolean {
    const control = this.ngControl?.control;
    if (!control) return false;

    const validator = control.validator ? control.validator(control) : null;
    return validator && validator['required'] ? true : false;
  }
}
