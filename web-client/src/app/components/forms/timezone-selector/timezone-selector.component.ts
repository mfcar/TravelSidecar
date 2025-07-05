import { Overlay, OverlayModule, OverlayRef } from '@angular/cdk/overlay';
import { PortalModule, TemplatePortal } from '@angular/cdk/portal';
import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  model,
  OnDestroy,
  signal,
  TemplateRef,
  viewChild,
  ViewContainerRef,
  computed,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NgControl } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Subject, takeUntil } from 'rxjs';
import { Timezone } from '../../../models/timezone.model';
import { TimezoneService } from '../../../services/timezone.service';

@Component({
  selector: 'ts-timezone-selector',
  imports: [NgClass, FormsModule, PortalModule, OverlayModule, FontAwesomeModule],
  templateUrl: './timezone-selector.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimezoneSelectorComponent implements ControlValueAccessor, OnDestroy {
  label = input<string>('Timezone');
  placeholder = input<string>('Select timezone');
  showRequiredIndicator = input<boolean>(false);
  value = model<string | null>(null);

  // Services
  private timezoneService = inject(TimezoneService);
  private overlay = inject(Overlay);
  private ngControl = inject(NgControl, { optional: true });
  private viewContainerRef = inject(ViewContainerRef);

  // UI state
  protected isOpen = signal(false);
  protected isDisabled = signal(false);
  protected searchText = signal<string>('');
  protected activeItemIndex = signal<number>(-1);

  // Data
  protected timezones = signal<Timezone[]>([]);
  protected selectedTimezone = computed(() => {
    const currentValue = this.value();
    if (!currentValue) return null;
    return this.timezones().find((tz) => tz.id === currentValue) || null;
  });

  // Filtered timezones based on search
  protected filteredTimezones = computed(() => {
    const search = this.searchText().toLowerCase().trim();
    const tzList = this.timezones();

    if (!search) return tzList;

    return tzList.filter(
      (tz) =>
        tz.id.toLowerCase().includes(search) ||
        tz.gmtOffset.toLowerCase().includes(search),
    );
  });

  // Cleanup subscriptions
  private destroy$ = new Subject<void>();

  // References
  protected triggerEl = viewChild.required<ElementRef>('trigger');
  protected searchInput = viewChild<ElementRef>('searchInput');
  protected dropdownTpl = viewChild<TemplateRef<any>>('dropdownTpl');
  protected overlayRef: OverlayRef | null = null;

  private uniqueId = Math.random().toString(36).substring(2, 15);
  protected inputId = `timezone-select-${this.uniqueId}`;
  protected listboxId = `timezone-listbox-${this.uniqueId}`;
  protected searchId = `timezone-search-${this.uniqueId}`;

  // Callbacks for ControlValueAccessor
  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }

    // Load timezones
    this.timezoneService
      .getAllTimezones()
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        this.timezones.set(response.items);
      });
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;
    const triggerElement = this.triggerEl()?.nativeElement;
    
    if (this.overlayRef) {
      const overlayElement = this.overlayRef.overlayElement;
      const clickedInside = 
        triggerElement?.contains(targetElement) || 
        overlayElement?.contains(targetElement);
      
      if (!clickedInside && this.isOpen()) {
        this.close();
      }
    }
  }

  toggle(): void {
    if (this.isDisabled()) return;

    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }

    this.onTouched();
  }

  open(): void {
    if (this.isOpen() || this.isDisabled()) return;

    this.isOpen.set(true);
    this.createAndAttachOverlay();

    // Focus search input after opening
    setTimeout(() => {
      this.searchInput()?.nativeElement?.focus();
    }, 10);
  }

  close(): void {
    if (!this.isOpen()) return;

    this.isOpen.set(false);
    this.activeItemIndex.set(-1);
    this.searchText.set('');

    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }

  private createAndAttachOverlay(): void {
    if (this.overlayRef) {
      this.overlayRef.dispose();
    }

    const triggerRect = this.triggerEl().nativeElement.getBoundingClientRect();

    this.overlayRef = this.overlay.create({
      width: triggerRect.width,
      maxHeight: 350,
      backdropClass: '',
      panelClass: 'timezone-select-overlay',
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.triggerEl())
        .withPositions([
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top',
            offsetY: 4,
          },
          {
            originX: 'start',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'bottom',
            offsetY: -4,
          },
        ])
        .withViewportMargin(8),
    });

    const templateRef = this.dropdownTpl();
    if (templateRef) {
      const portal = new TemplatePortal(templateRef, this.viewContainerRef);
      this.overlayRef.attach(portal);
    }
  }

  selectItem(timezone: Timezone): void {
    this.value.set(timezone.id);
    this.onChange(timezone.id);
    this.close();
    this.triggerEl().nativeElement.focus();
  }

  updateSearchText(value: string): void {
    this.searchText.set(value);
    this.activeItemIndex.set(-1);
  }

  onTriggerKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.toggle();
        break;
      case 'ArrowDown':
        if (!this.isOpen()) {
          event.preventDefault();
          this.open();
        }
        break;
      case 'Escape':
        if (this.isOpen()) {
          event.preventDefault();
          this.close();
          this.triggerEl().nativeElement.focus();
        }
        break;
    }
  }

  onSearchKeydown(event: KeyboardEvent): void {
    const filtered = this.filteredTimezones();
    const currentIndex = this.activeItemIndex();

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.close();
        this.triggerEl().nativeElement.focus();
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (currentIndex < filtered.length - 1) {
          this.activeItemIndex.set(currentIndex + 1);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (currentIndex > 0) {
          this.activeItemIndex.set(currentIndex - 1);
        }
        break;
      case 'Enter':
        event.preventDefault();
        if (currentIndex >= 0 && currentIndex < filtered.length) {
          this.selectItem(filtered[currentIndex]);
        } else if (filtered.length === 1) {
          this.selectItem(filtered[0]);
        }
        break;
    }
  }

  isItemActive(index: number): boolean {
    return this.activeItemIndex() === index;
  }

  // ControlValueAccessor methods
  writeValue(value: string | null): void {
    this.value.set(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
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

    return 'Invalid selection.';
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

    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }
}