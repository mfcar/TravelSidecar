import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ControlValueAccessor, FormsModule, NgControl } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'ts-text-input',
  imports: [FormsModule, FontAwesomeModule, NgClass],
  templateUrl: './text-input.component.html',
  styleUrl: './text-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextInputComponent implements ControlValueAccessor {
  public label = input<string>();
  public placeholder = input<string>('');
  public helpText = input<string>();
  public typeField = input<'text' | 'email' | 'url' | 'password' | 'time'>('text');
  public autoCompleteField = input<string>('off');
  public tabIndex = input<number>(0);
  public showRequiredIndicator = input<boolean>(false);

  inputValue = '';

  private ngControl = inject(NgControl);
  protected onTouched?: () => {};
  protected onChange?: (value: string) => {};
  protected isDisabled = false;

  private uniqueId = Math.random().toString(36).substring(2, 15);
  inputId = `input-${this.uniqueId}`;
  helpTextId = `help-${this.uniqueId}`;
  errorId = `error-${this.uniqueId}`;

  constructor() {
    if (this.ngControl) this.ngControl.valueAccessor = this;
  }

  writeValue(value: string): void {
    this.inputValue = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  get hasError(): boolean {
    return !!this.ngControl?.control?.invalid && !!this.ngControl?.control?.touched;
  }

  get errorMessage(): string {
    if (!this.ngControl?.control?.errors) return '';

    const errors = this.ngControl.control.errors;

    if (errors['required']) {
      // return $localize`:@@requiredError:This field is required.`;
      return `This field is required.`;
    }

    if (errors['maxlength']) {
      // return $localize`:@@maxlengthError:Maximum length is ${errors['maxlength'].requiredLength} characters.`;
      return `Maximum length is ${errors['maxlength'].requiredLength} characters.`;
    }

    // return $localize`:@@invalidInputError:Invalid input.`;
    return `Invalid input.`;
  }

  get maxLength(): number | null {
    const control = this.ngControl?.control;
    if (!control) return null;

    const validator = control.validator ? control.validator(control) : null;
    if (validator && validator['maxlength']) {
      return validator['maxlength'].requiredLength;
    }

    return null;
  }

  get isRequired(): boolean {
    const control = this.ngControl?.control;
    if (!control) return false;

    const validator = control.validator ? control.validator(control) : null;
    return validator && validator['required'] ? true : false;
  }
}
