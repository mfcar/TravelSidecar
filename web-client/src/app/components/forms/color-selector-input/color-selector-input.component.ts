import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  OnDestroy,
  signal,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NgControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { STANDARD_DROPDOWN_POSITIONS } from '../../../shared/constants/overlay-positions';

interface TailwindColor {
  name: string;
  displayName: string;
}

@Component({
  selector: 'ts-color-selector-input',
  imports: [NgClass, FormsModule, OverlayModule],
  templateUrl: './color-selector-input.component.html',
  styleUrl: './color-selector-input.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorSelectorInputComponent implements ControlValueAccessor, OnDestroy {
  // Inputs
  public label = input<string>('Color');
  public helpText = input<string>();
  public tabIndex = input<number>(0);
  public showRequiredIndicator = input<boolean>(false);

  // UI State
  public showColorPicker = signal(false);
  public selectedColorName = signal<string | null>(null);

  // Services and references
  private ngControl = inject(NgControl);
  private elementRef = inject(ElementRef);

  // Control value accessor
  protected onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};
  protected isDisabled = false;

  // Unique IDs for accessibility
  private uniqueId = Math.random().toString(36).substring(2, 15);
  protected inputId = `color-input-${this.uniqueId}`;
  protected helpTextId = `color-help-${this.uniqueId}`;
  protected errorId = `color-error-${this.uniqueId}`;
  protected colorPickerId = `color-picker-${this.uniqueId}`;

  // Cleanup
  private destroy$ = new Subject<void>();

  // Position strategy
  protected positions: ConnectedPosition[] = STANDARD_DROPDOWN_POSITIONS;

  // Tailwind Colors
  protected tailwindColors: TailwindColor[] = [
    { name: 'red', displayName: 'Red' },
    { name: 'orange', displayName: 'Orange' },
    { name: 'amber', displayName: 'Amber' },
    { name: 'yellow', displayName: 'Yellow' },
    { name: 'lime', displayName: 'Lime' },
    { name: 'green', displayName: 'Green' },
    { name: 'emerald', displayName: 'Emerald' },
    { name: 'teal', displayName: 'Teal' },
    { name: 'cyan', displayName: 'Cyan' },
    { name: 'sky', displayName: 'Sky' },
    { name: 'blue', displayName: 'Blue' },
    { name: 'indigo', displayName: 'Indigo' },
    { name: 'violet', displayName: 'Violet' },
    { name: 'purple', displayName: 'Purple' },
    { name: 'fuchsia', displayName: 'Fuchsia' },
    { name: 'pink', displayName: 'Pink' },
    { name: 'rose', displayName: 'Rose' },
    { name: 'slate', displayName: 'Slate' },
    { name: 'gray', displayName: 'Gray' },
    { name: 'zinc', displayName: 'Zinc' },
    { name: 'neutral', displayName: 'Neutral' },
    { name: 'stone', displayName: 'Stone' },
  ];

  constructor() {
    if (this.ngControl) this.ngControl.valueAccessor = this;
  }

  writeValue(value: string): void {
    this.selectedColorName.set(value || null);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  toggle(): void {
    if (!this.isDisabled) {
      this.showColorPicker.set(!this.showColorPicker());
      this.onTouched();
    }
  }

  close(): void {
    this.showColorPicker.set(false);
  }

  selectColor(color: TailwindColor): void {
    this.selectedColorName.set(color.name);
    this.onChange(color.name);
    this.onTouched();
    this.close();
  }

  getSelectedColorDisplayName(): string {
    if (!this.selectedColorName()) return '';
    const selectedColor = this.tailwindColors.find((c) => c.name === this.selectedColorName());
    return selectedColor ? selectedColor.displayName : '';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showColorPicker.set(false);
    }
  }

  get hasError(): boolean {
    return !!this.ngControl?.control?.invalid && !!this.ngControl?.control?.touched;
  }

  get errorMessage(): string {
    if (!this.ngControl?.control?.errors) return '';

    const errors = this.ngControl.control.errors;

    if (errors['required']) {
      return 'This field is required.';
    }

    return 'Invalid color.';
  }

  get isRequired(): boolean {
    const control = this.ngControl?.control;
    if (!control) return false;

    const validator = control.validator ? control.validator(control) : null;
    return validator && validator['required'] ? true : false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
