import { NgClass, NgStyle } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NgControl } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ColorChromeModule } from 'ngx-color/chrome';

@Component({
  selector: 'ts-color-input',
  imports: [NgClass, FontAwesomeModule, FormsModule, NgStyle, ColorChromeModule],
  templateUrl: './color-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorInputComponent implements ControlValueAccessor {
  public label = input<string>();
  public helpText = input<string>();
  public tabIndex = input<number>(0);
  public showColorPicker = signal(false);
  public showRequiredIndicator = input<boolean>(false);

  inputValue = '';

  private ngControl = inject(NgControl);
  private _elementRef = inject(ElementRef);
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
      return $localize`:@@requiredError:This field is required.`;
    }

    return $localize`:@@invalidInputError:Invalid input.`;
  }

  get isRequired(): boolean {
    const control = this.ngControl?.control;
    if (!control) return false;

    const validator = control.validator ? control.validator(control) : null;
    return validator && validator['required'] ? true : false;
  }

  toggleColorPicker(): void {
    this.showColorPicker.set(!this.showColorPicker());
  }

  handleColorChange(event: any): void {
    const newColor = event.color.hex;
    this.inputValue = newColor;
    if (this.onChange) {
      this.onChange(newColor);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this._elementRef.nativeElement.contains(event.target)) {
      this.showColorPicker.set(false);
    }
  }
}
