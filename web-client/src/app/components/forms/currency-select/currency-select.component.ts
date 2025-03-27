import { Overlay, OverlayModule, OverlayRef } from '@angular/cdk/overlay';
import { PortalModule, TemplatePortal } from '@angular/cdk/portal';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { AsyncPipe, NgClass } from '@angular/common';
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
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NgControl } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheck, faChevronDown, faSearch } from '@fortawesome/free-solid-svg-icons';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  Observable,
  Subject,
  take,
  takeUntil,
} from 'rxjs';
import { Currency } from '../../../models/currency.model';
import { CurrencyService } from '../../../services/currency.service';

@Component({
  selector: 'ts-currency-select',
  imports: [
    NgClass,
    FormsModule,
    ScrollingModule,
    PortalModule,
    OverlayModule,
    FontAwesomeModule,
    AsyncPipe,
  ],
  templateUrl: './currency-select.component.html',
  styleUrl: './currency-select.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencySelectComponent implements ControlValueAccessor, OnDestroy {
  public label = input<string>('Currency');
  public placeholder = input<string>('Select currency');
  public showRequiredIndicator = input<boolean>(false);
  public value = model<string | null>(null);

  // Icons
  protected readonly faChevronDown = faChevronDown;
  protected readonly faCheck = faCheck;
  protected readonly faSearch = faSearch;

  // Services
  private currencyService = inject(CurrencyService);
  private overlay = inject(Overlay);
  private ngControl = inject(NgControl, { optional: true });

  // UI state
  protected isOpen = signal(false);
  protected isDisabled = signal(false);
  protected currencies$ = this.currencyService.getAllCurrencies();
  protected selectedCurrency = signal<Currency | null>(null);
  protected searchText = signal<string>('');
  protected itemSize = 40; // height of each item in px
  protected activeItemIndex = signal<number>(-1);

  // Search text as observable for filtering
  private searchTerms = new BehaviorSubject<string>('');

  // Cleanup subscriptions
  private destroy$ = new Subject<void>();

  // Timeouts
  private _searchFocusTimeout: any;
  private _scrollTimeout: any;
  private _navigationTimeout: any;

  // Filtered currencies
  protected filteredCurrencies$: Observable<Currency[]>;

  // References
  protected triggerEl = viewChild.required<ElementRef>('trigger');
  protected searchInput = viewChild<ElementRef>('searchInput');
  private viewContainerRef = inject(ViewContainerRef);
  protected dropdownTpl = viewChild<TemplateRef<any>>('dropdownTpl');
  protected overlayRef: OverlayRef | null = null;
  protected virtualScroll = viewChild<CdkVirtualScrollViewport>('virtualScroll');

  private uniqueId = Math.random().toString(36).substring(2, 15);
  protected inputId = `currency-select-${this.uniqueId}`;
  protected listboxId = `currency-listbox-${this.uniqueId}`;
  protected searchId = `currency-search-${this.uniqueId}`;

  // Callbacks for ControlValueAccessor
  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }

    this.filteredCurrencies$ = combineLatest([this.currencies$, this.searchTerms]).pipe(
      takeUntil(this.destroy$),
      map(([currencies, searchText]) => {
        const search = searchText.toLowerCase().trim();
        if (!search) return currencies;

        return currencies.filter(
          (currency: Currency) =>
            currency.code.toLowerCase().includes(search) ||
            currency.englishName.toLowerCase().includes(search),
        );
      }),
      distinctUntilChanged(
        (prev, curr) => prev.length === curr.length && prev[0]?.code === curr[0]?.code,
      ),
    );

    this.updateSelectedCurrencyFromValue();
  }

  private updateSelectedCurrencyFromValue(): void {
    this.value.subscribe((currentValue) => {
      if (currentValue) {
        this.currencies$.pipe(take(1), takeUntil(this.destroy$)).subscribe((currencies) => {
          const selected = currencies.find((c) => c.code === currentValue);
          if (selected) {
            this.selectedCurrency.set(selected);
          }
        });
      } else {
        this.selectedCurrency.set(null);
      }
    });
  }

  updateSearchText(value: string): void {
    this.searchText.set(value);
    this.searchTerms.next(value);
    this.activeItemIndex.set(-1);
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;
    const triggerElement = this.triggerEl()?.nativeElement;
    const searchElement = this.searchInput()?.nativeElement;

    const clickedInside =
      triggerElement?.contains(targetElement) || searchElement?.contains(targetElement);

    if (!clickedInside && this.isOpen()) {
      this.close();
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

    if (this.selectedCurrency()) {
      this.filteredCurrencies$.pipe(take(1), takeUntil(this.destroy$)).subscribe((currencies) => {
        const selectedIndex = currencies.findIndex((c) => c.code === this.selectedCurrency()?.code);

        if (selectedIndex > -1) {
          this.activeItemIndex.set(selectedIndex);

          this._scrollTimeout = setTimeout(() => {
            this.virtualScroll()?.scrollToIndex(selectedIndex);
          }, 50);
        }
      });
    }

    this._searchFocusTimeout = setTimeout(() => {
      const searchInput = this.searchInput()?.nativeElement;
      if (searchInput) {
        searchInput.focus();
      }
    }, 10);
  }

  close(): void {
    if (!this.isOpen()) return;

    this.isOpen.set(false);
    this.activeItemIndex.set(-1);
    this.searchText.set('');
    this.searchTerms.next('');

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
      panelClass: 'currency-select-overlay',
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
        .withViewportMargin(8)
        .withGrowAfterOpen(true)
        .withPush(false),
    });

    const templateRef = this.dropdownTpl();
    if (templateRef) {
      const portal = new TemplatePortal(templateRef, this.viewContainerRef);
      this.overlayRef.attach(portal);
    }
  }

  selectItem(currency: Currency): void {
    this.selectedCurrency.set(currency);
    this.value.set(currency.code);
    this.onChange(currency.code);
    this.close();
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
        }
        break;
    }
  }

  onSearchKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.close();
        this.triggerEl().nativeElement.focus();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.navigateOptions(0);
        break;
      case 'Enter':
        this.filteredCurrencies$
          .pipe(take(1), takeUntil(this.destroy$))
          .subscribe((currencies: Currency[]) => {
            if (currencies.length === 1) {
              this.selectItem(currencies[0]);
            }
          });
        break;
    }
  }

  onOptionKeydown(event: KeyboardEvent, currency: Currency, index: number): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.selectItem(currency);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.navigateOptions(index + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (index === 0) {
          this.searchInput()?.nativeElement?.focus();
        } else {
          this.navigateOptions(index - 1);
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.close();
        this.triggerEl().nativeElement.focus();
        break;
      case 'Tab':
        this.close();
        break;
    }
  }

  onOptionFocus(index: number): void {
    this.activeItemIndex.set(index);
  }

  private navigateOptions(index: number): void {
    this.filteredCurrencies$
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe((currencies: Currency[]) => {
        if (currencies.length === 0) return;

        if (index < 0) {
          index = currencies.length - 1;
        } else if (index >= currencies.length) {
          index = 0;
        }

        this.activeItemIndex.set(index);

        this._navigationTimeout = setTimeout(() => {
          if (this.virtualScroll()) {
            this.virtualScroll()?.scrollToIndex(index);

            const options = document.querySelectorAll(`#${this.listboxId} [role="option"]`);
            if (options[index]) {
              (options[index] as HTMLElement).focus();
            }
          }
        });
      });
  }

  // ControlValueAccessor methods
  writeValue(value: string): void {
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    this.searchTerms.complete();

    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }

    if (this._searchFocusTimeout) {
      clearTimeout(this._searchFocusTimeout);
    }

    if (this._scrollTimeout) {
      clearTimeout(this._scrollTimeout);
    }

    if (this._navigationTimeout) {
      clearTimeout(this._navigationTimeout);
    }
  }
}
