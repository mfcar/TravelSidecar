import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { AsyncPipe, NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  OnDestroy,
  signal,
  viewChild,
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
import { STANDARD_DROPDOWN_POSITIONS } from '../../../shared/constants/overlay-positions';

interface CurrencyPriceValue {
  price: number | null;
  currencyCode: string;
}

@Component({
  selector: 'ts-currency-price-input',
  standalone: true,
  imports: [
    NgClass,
    FormsModule,
    FontAwesomeModule,
    OverlayModule,
    PortalModule,
    ScrollingModule,
    AsyncPipe,
  ],
  templateUrl: './currency-price-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyPriceInputComponent implements ControlValueAccessor, OnDestroy {
  // Inputs
  public label = input<string>('Price');
  public placeholder = input<string>('0.00');
  public showRequiredIndicator = input<boolean>(false);
  public helpText = input<string>();
  public defaultCurrencyCode = input<string>('USD');

  // Icons
  protected readonly faChevronDown = faChevronDown;
  protected readonly faSearch = faSearch;
  protected readonly faCheck = faCheck;

  // Services
  private currencyService = inject(CurrencyService);
  private ngControl = inject(NgControl, { optional: true });

  // UI state
  protected isOpen = signal(false);
  protected isDisabled = signal(false);
  protected currencies$ = this.currencyService.getAllCurrencies();
  protected selectedCurrency = signal<Currency | null>(null);
  protected priceValue = signal<string>('');
  protected searchText = signal<string>('');
  protected activeItemIndex = signal<number>(-1);
  protected filteredCurrencies$: Observable<Currency[]>;

  // References
  protected currencyTrigger = viewChild.required<ElementRef>('currencyTrigger');
  protected priceInput = viewChild.required<ElementRef>('priceInput');
  protected searchInput = viewChild<ElementRef>('searchInput');
  protected virtualScroll = viewChild<CdkVirtualScrollViewport>('virtualScroll');

  // Search and cleanup
  private searchTerms = new BehaviorSubject<string>('');
  private destroy$ = new Subject<void>();
  private scrollTimeout?: number;
  private focusTimeout?: number;

  // Unique IDs for accessibility
  private uniqueId = Math.random().toString(36).substring(2, 15);
  protected inputId = `currency-price-${this.uniqueId}`;
  protected currencyId = `currency-select-${this.uniqueId}`;
  protected listboxId = `currency-listbox-${this.uniqueId}`;
  protected helpTextId = `help-${this.uniqueId}`;
  protected searchId = `currency-search-${this.uniqueId}`;

  // ControlValueAccessor callbacks
  protected onChange: (value: CurrencyPriceValue) => void = () => {};
  protected onTouched: () => void = () => {};

  // Position strategy
  protected positions: ConnectedPosition[] = STANDARD_DROPDOWN_POSITIONS;

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }

    this.filteredCurrencies$ = this.createFilteredCurrenciesObservable();

    this.initializeDefaultCurrency();
  }

  private createFilteredCurrenciesObservable(): Observable<Currency[]> {
    return combineLatest([this.currencies$, this.searchTerms]).pipe(
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
  }

  private initializeDefaultCurrency(): void {
    this.currencies$.pipe(take(1), takeUntil(this.destroy$)).subscribe((currencies) => {
      const defaultCurrency = currencies.find((c) => c.code === this.defaultCurrencyCode());
      if (defaultCurrency) {
        this.selectedCurrency.set(defaultCurrency);
      } else if (currencies.length > 0) {
        this.selectedCurrency.set(currencies[0]);
      }
    });
  }

  updateSearchText(value: string): void {
    this.searchText.set(value);
    this.searchTerms.next(value);
    this.activeItemIndex.set(-1);
  }

  updateValue(): void {
    const price = this.priceValue() ? parseFloat(this.priceValue()) : null;
    this.onChange({
      price,
      currencyCode: this.selectedCurrency()?.code || this.defaultCurrencyCode(),
    });
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;
    const triggerElement = this.currencyTrigger()?.nativeElement;
    const searchElement = this.searchInput()?.nativeElement;

    const clickedInside =
      triggerElement?.contains(targetElement) || searchElement?.contains(targetElement);

    if (!clickedInside && this.isOpen()) {
      this.closeCurrencyDropdown();
    }
  }

  toggleCurrencyDropdown(): void {
    if (this.isDisabled()) return;

    if (this.isOpen()) {
      this.closeCurrencyDropdown();
    } else {
      this.openCurrencyDropdown();
    }

    this.onTouched();
  }

  openCurrencyDropdown(): void {
    if (this.isOpen() || this.isDisabled()) return;

    this.isOpen.set(true);

    setTimeout(() => {
      if (this.selectedCurrency()) {
        this.filteredCurrencies$.pipe(take(1), takeUntil(this.destroy$)).subscribe((currencies) => {
          const selectedIndex = currencies.findIndex(
            (c) => c.code === this.selectedCurrency()?.code,
          );

          if (selectedIndex > -1) {
            this.activeItemIndex.set(selectedIndex);
            this.virtualScroll()?.scrollToIndex(selectedIndex);
          }
        });
      }

      this.searchInput()?.nativeElement?.focus();
    }, 10);
  }

  closeCurrencyDropdown(): void {
    if (!this.isOpen()) return;

    this.isOpen.set(false);
    this.activeItemIndex.set(-1);
    this.searchText.set('');
    this.searchTerms.next('');
  }

  selectCurrency(currency: Currency): void {
    this.selectedCurrency.set(currency);
    this.closeCurrencyDropdown();
    this.updateValue();

    if (this.focusTimeout) {
      window.clearTimeout(this.focusTimeout);
    }

    this.focusTimeout = window.setTimeout(() => {
      this.priceInput().nativeElement.focus();
    }, 10);
  }

  onPriceChange(value: string): void {
    this.priceValue.set(value);
    this.updateValue();
  }

  onSearchKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.closeCurrencyDropdown();
        this.currencyTrigger().nativeElement.focus();
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
              this.selectCurrency(currencies[0]);
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
        this.selectCurrency(currency);
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
        this.closeCurrencyDropdown();
        this.currencyTrigger().nativeElement.focus();
        break;
      case 'Tab':
        this.closeCurrencyDropdown();
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

        if (this.scrollTimeout) {
          window.clearTimeout(this.scrollTimeout);
        }

        this.scrollTimeout = window.setTimeout(() => {
          if (this.virtualScroll()) {
            this.virtualScroll()?.scrollToIndex(index);

            const options = document.querySelectorAll(`#${this.listboxId} [role="option"]`);
            if (options[index]) {
              (options[index] as HTMLElement).focus();
            }
          }
        }, 50);
      });
  }

  writeValue(value: CurrencyPriceValue | null): void {
    if (value) {
      this.priceValue.set(value.price?.toString() || '');

      if (value.currencyCode) {
        this.currencies$.pipe(take(1), takeUntil(this.destroy$)).subscribe((currencies) => {
          const currency = currencies.find((c) => c.code === value.currencyCode);
          if (currency) {
            this.selectedCurrency.set(currency);
          }
        });
      }
    } else {
      this.priceValue.set('');
    }
  }

  registerOnChange(fn: (value: CurrencyPriceValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
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

    return 'Invalid value.';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchTerms.complete();

    if (this.focusTimeout) {
      window.clearTimeout(this.focusTimeout);
    }

    if (this.scrollTimeout) {
      window.clearTimeout(this.scrollTimeout);
    }
  }
}
