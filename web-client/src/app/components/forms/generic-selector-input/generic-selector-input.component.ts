import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { AsyncPipe, NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  OnDestroy,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NgControl } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCheck,
  faChevronDown,
  faPlus,
  faSearch,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  Observable,
  of,
  ReplaySubject,
  shareReplay,
  Subject,
  switchMap,
  take,
  takeUntil,
} from 'rxjs';
import { STANDARD_DROPDOWN_POSITIONS } from '../../../shared/constants/overlay-positions';

type SelectableItem = Record<string, any>;

@Component({
  selector: 'ts-generic-selector-input',
  imports: [
    NgClass,
    FormsModule,
    FontAwesomeModule,
    OverlayModule,
    PortalModule,
    ScrollingModule,
    AsyncPipe,
  ],
  templateUrl: './generic-selector-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenericSelectorInputComponent<T extends SelectableItem = SelectableItem>
  implements ControlValueAccessor, OnDestroy
{
  // Configuration inputs
  public label = input<string>('Select item');
  public placeholder = input<string>('Select an option');
  public showRequiredIndicator = input<boolean>(false);
  public helpText = input<string>();
  public multiple = input<boolean>(false);
  public showCreateButton = input<boolean>(false);
  public createButtonLabel = input<string>('New');
  public itemLabelKey = input<string>('name');
  public itemSecondaryTextKey = input<string | null>();
  public itemValueKey = input<string>('id');
  public items = input<T[]>([]);
  public showClearButton = input<boolean>(true);

  // Output for create item action
  public createButtonClicked = output<void>();

  // Icons
  protected readonly faChevronDown = faChevronDown;
  protected readonly faSearch = faSearch;
  protected readonly faCheck = faCheck;
  protected readonly faPlus = faPlus;
  protected readonly faXmark = faXmark;

  // Services
  private ngControl = inject(NgControl, { optional: true });

  // UI state
  protected isOpen = signal(false);
  protected isDisabled = signal(false);
  protected selectedValues = signal<unknown[]>([]);
  protected selectedItems = signal<T[]>([]);
  protected searchText = signal<string>('');
  protected activeItemIndex = signal<number>(-1);
  private refreshTrigger = new BehaviorSubject<boolean>(true);
  protected allItems$: Observable<T[]>;
  protected filteredItems$: Observable<T[]>;
  private pendingSelection = new ReplaySubject<unknown[]>(1);

  // References
  protected trigger = viewChild.required<ElementRef>('trigger');
  protected searchInput = viewChild<ElementRef>('searchInput');
  protected virtualScroll = viewChild<CdkVirtualScrollViewport>('virtualScroll');

  // Search and cleanup
  private searchTerms = new BehaviorSubject<string>('');
  private destroy$ = new Subject<void>();
  private scrollTimeout?: number;

  // Unique IDs for accessibility
  private uniqueId = Math.random().toString(36).substring(2, 15);
  protected inputId = `generic-selector-${this.uniqueId}`;
  protected listboxId = `generic-listbox-${this.uniqueId}`;
  protected helpTextId = `help-${this.uniqueId}`;
  protected searchId = `generic-search-${this.uniqueId}`;

  // ControlValueAccessor callbacks
  protected onChange: (value: unknown) => void = () => {};
  protected onTouched: () => void = () => {};

  // Position strategy
  protected positions: ConnectedPosition[] = STANDARD_DROPDOWN_POSITIONS;
  protected get triggerWidth(): number {
    return this.trigger()?.nativeElement?.offsetWidth || 300;
  }

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }

    effect(() => {
      this.refreshTrigger.next(true);
    });

    this.allItems$ = this.refreshTrigger.pipe(
      switchMap(() => of(this.items())),
      shareReplay(1),
      takeUntil(this.destroy$),
    );

    this.allItems$.pipe(takeUntil(this.destroy$)).subscribe((items) => {
      this.pendingSelection.pipe(take(1)).subscribe((values) => {
        if (values && values.length > 0) {
          const selectedItems = items.filter((item) => values.includes(item[this.itemValueKey()]));

          if (this.multiple()) {
            this.selectedValues.set(values);
            this.selectedItems.set(selectedItems);
          } else if (values.length > 0) {
            this.selectedValues.set([values[0]]);
            this.selectedItems.set(selectedItems.length > 0 ? [selectedItems[0]] : []);
          }
        }
      });
    });

    this.filteredItems$ = this.createFilteredItemsObservable();
  }

  private createFilteredItemsObservable(): Observable<T[]> {
    return combineLatest([this.allItems$, this.searchTerms]).pipe(
      takeUntil(this.destroy$),
      map(([items, searchText]) => {
        const search = searchText.toLowerCase().trim();
        if (!search) return items;

        return items.filter((item: T) => {
          const label = String(item[this.itemLabelKey()]).toLowerCase();

          const secondaryTextKey = this.itemSecondaryTextKey();
          if (secondaryTextKey && item[secondaryTextKey]) {
            const secondaryText = String(item[secondaryTextKey]).toLowerCase();
            return label.includes(search) || secondaryText.includes(search);
          }

          return label.includes(search);
        });
      }),
      distinctUntilChanged(
        (prev, curr) =>
          prev.length === curr.length &&
          prev[0]?.[this.itemValueKey()] === curr[0]?.[this.itemValueKey()],
      ),
    );
  }

  updateSearchText(value: string): void {
    this.searchText.set(value);
    this.searchTerms.next(value);
    this.activeItemIndex.set(-1);
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;
    const triggerElement = this.trigger()?.nativeElement;
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

    setTimeout(() => {
      this.searchInput()?.nativeElement?.focus();
    }, 10);
  }

  close(): void {
    if (!this.isOpen()) return;

    this.isOpen.set(false);
    this.activeItemIndex.set(-1);
    this.searchText.set('');
    this.searchTerms.next('');
  }

  toggleItem(item: T, event?: Event): void {
    event?.stopPropagation();
    const value = item[this.itemValueKey()];

    if (this.multiple()) {
      const selectedValuesList = [...this.selectedValues()];
      const index = selectedValuesList.indexOf(value);

      if (index === -1) {
        selectedValuesList.push(value);
        const updatedItems = [...this.selectedItems(), item];
        this.selectedItems.set(updatedItems);
      } else {
        selectedValuesList.splice(index, 1);
        const updatedItems = this.selectedItems().filter((i) => i[this.itemValueKey()] !== value);
        this.selectedItems.set(updatedItems);
      }

      this.selectedValues.set(selectedValuesList);
      this.onChange(selectedValuesList);
    } else {
      this.selectedValues.set([value]);
      this.selectedItems.set([item]);
      this.onChange(value);
      this.close();
    }
  }

  isItemSelected(value: unknown): boolean {
    return this.selectedValues().includes(value);
  }

  clearAllItems(event: Event): void {
    event.stopPropagation();
    this.selectedValues.set([]);
    this.selectedItems.set([]);
    this.onChange(this.multiple() ? [] : null);
  }

  removeItem(value: unknown, event: Event): void {
    event.stopPropagation();

    if (this.multiple()) {
      const selectedValuesList = this.selectedValues().filter((v) => v !== value);
      const selectedItemsList = this.selectedItems().filter(
        (i) => i[this.itemValueKey()] !== value,
      );

      this.selectedValues.set(selectedValuesList);
      this.selectedItems.set(selectedItemsList);
      this.onChange(selectedValuesList);
    } else {
      this.selectedValues.set([]);
      this.selectedItems.set([]);
      this.onChange(null);
    }
  }

  handleCreateButtonClick(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    this.createButtonClicked.emit();
  }

  refreshItems(): void {
    this.refreshTrigger.next(true);
  }

  addNewlyCreatedItem(item: T): void {
    const value = item[this.itemValueKey()];

    if (this.multiple()) {
      const selectedValues = [...this.selectedValues(), value];
      const selectedItems = [...this.selectedItems(), item];
      this.selectedValues.set(selectedValues);
      this.selectedItems.set(selectedItems);
      this.onChange(selectedValues);
    } else {
      this.selectedValues.set([value]);
      this.selectedItems.set([item]);
      this.onChange(value);
    }
  }

  onSearchKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.close();
        this.trigger().nativeElement.focus();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.navigateOptions(0);
        break;
    }
  }

  onOptionKeydown(event: KeyboardEvent, item: T, index: number): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.toggleItem(item);
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
        this.trigger().nativeElement.focus();
        break;
    }
  }

  onOptionFocus(index: number): void {
    this.activeItemIndex.set(index);
  }

  private navigateOptions(index: number): void {
    this.filteredItems$.pipe(take(1), takeUntil(this.destroy$)).subscribe((items: T[]) => {
      if (items.length === 0) return;

      if (index < 0) {
        index = items.length - 1;
      } else if (index >= items.length) {
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

  writeValue(value: unknown): void {
    if (value !== null && value !== undefined) {
      if (this.multiple()) {
        const valueArray = Array.isArray(value) ? value : [value];
        this.selectedValues.set(valueArray);
        this.pendingSelection.next(valueArray);
      } else {
        const valueArray = [value];
        this.selectedValues.set(valueArray);
        this.pendingSelection.next(valueArray);
      }

      this.allItems$.pipe(take(1), takeUntil(this.destroy$)).subscribe((items) => {
        if (this.multiple()) {
          const selectedItems = items.filter(
            (item) => Array.isArray(value) && value.includes(item[this.itemValueKey()]),
          );
          this.selectedItems.set(selectedItems);
        } else {
          const selectedItem = items.find((item) => item[this.itemValueKey()] === value);
          this.selectedItems.set(selectedItem ? [selectedItem] : []);
        }
      });
    } else {
      this.selectedValues.set([]);
      this.selectedItems.set([]);
      this.pendingSelection.next([]);
    }
  }

  registerOnChange(fn: (value: unknown) => void): void {
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

    return 'Invalid selection.';
  }

  getItemSecondaryText(item: T): string | null {
    const key = this.itemSecondaryTextKey();
    return key ? String(item[key] || '') || null : null;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchTerms.complete();
    this.pendingSelection.complete();

    if (this.scrollTimeout) {
      window.clearTimeout(this.scrollTimeout);
    }
  }
}
