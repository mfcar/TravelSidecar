import { Dialog } from '@angular/cdk/dialog';
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
  ReplaySubject,
  shareReplay,
  Subject,
  switchMap,
  take,
  takeUntil,
} from 'rxjs';
import { Tag, TagFilterRequest, TagResponse } from '../../../models/tags.model';
import { TagService } from '../../../services/tag.service';
import { STANDARD_DROPDOWN_POSITIONS } from '../../../shared/constants/overlay-positions';
import { TagBadgeComponent } from '../../badges/tag-badge/tag-badge.component';
import { CreateUpdateTagModal } from '../../modals/tags/create-update-tag/create-update-tag.modal';

@Component({
  selector: 'ts-tags-selector-input',
  standalone: true,
  imports: [
    NgClass,
    FormsModule,
    FontAwesomeModule,
    OverlayModule,
    PortalModule,
    ScrollingModule,
    AsyncPipe,
    TagBadgeComponent,
  ],
  templateUrl: './tags-selector-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagsSelectorInputComponent implements ControlValueAccessor, OnDestroy {
  // Inputs
  public label = input<string>('Tags');
  public placeholder = input<string>('Select tags');
  public showRequiredIndicator = input<boolean>(false);
  public helpText = input<string>();

  // Icons
  protected readonly faChevronDown = faChevronDown;
  protected readonly faSearch = faSearch;
  protected readonly faCheck = faCheck;
  protected readonly faPlus = faPlus;
  protected readonly faXmark = faXmark;

  // Services
  private tagService = inject(TagService);
  private ngControl = inject(NgControl, { optional: true });
  private dialog = inject(Dialog);

  // UI state
  protected isOpen = signal(false);
  protected isDisabled = signal(false);
  protected selectedTagIds = signal<string[]>([]);
  protected selectedTags = signal<Tag[]>([]);
  protected searchText = signal<string>('');
  protected activeItemIndex = signal<number>(-1);
  private refreshTrigger = new BehaviorSubject<boolean>(true);
  protected allTags$: Observable<Tag[]>;
  protected filteredTags$: Observable<Tag[]>;
  private pendingSelection = new ReplaySubject<string[]>(1);

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
  protected inputId = `tags-selector-${this.uniqueId}`;
  protected listboxId = `tags-listbox-${this.uniqueId}`;
  protected helpTextId = `help-${this.uniqueId}`;
  protected searchId = `tags-search-${this.uniqueId}`;

  // ControlValueAccessor callbacks
  protected onChange: (value: string[]) => void = () => {};
  protected onTouched: () => void = () => {};

  // Position strategy
  protected positions: ConnectedPosition[] = STANDARD_DROPDOWN_POSITIONS;

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }

    this.allTags$ = this.refreshTrigger.pipe(
      switchMap(() => this.loadTagsFromApi()),
      shareReplay(1),
      takeUntil(this.destroy$),
    );

    this.allTags$.pipe(takeUntil(this.destroy$)).subscribe((tags) => {
      this.pendingSelection.pipe(take(1)).subscribe((tagIds) => {
        if (tagIds && tagIds.length > 0) {
          const selectedTags = tags.filter((tag) => tagIds.includes(tag.id));
          this.selectedTagIds.set(tagIds);
          this.selectedTags.set(selectedTags);
        }
      });
    });

    this.filteredTags$ = this.createFilteredTagsObservable(this.allTags$);
  }

  private loadTagsFromApi(): Observable<Tag[]> {
    return this.tagService
      .getTags({
        page: 1,
        pageSize: 1000,
        searchTerm: '',
        sortBy: 'name',
        sortOrder: 'asc',
      } as TagFilterRequest)
      .pipe(map((response) => response.items || []));
  }

  private createFilteredTagsObservable(tagsSource: Observable<Tag[]>): Observable<Tag[]> {
    return combineLatest([tagsSource, this.searchTerms]).pipe(
      takeUntil(this.destroy$),
      map(([tags, searchText]) => {
        const search = searchText.toLowerCase().trim();
        if (!search) return tags;

        return tags.filter((tag: Tag) => tag.name.toLowerCase().includes(search));
      }),
      distinctUntilChanged(
        (prev, curr) => prev.length === curr.length && prev[0]?.id === curr[0]?.id,
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

  toggleTag(tag: Tag, event?: Event): void {
    event?.stopPropagation();

    const selectedIds = [...this.selectedTagIds()];
    const index = selectedIds.indexOf(tag.id);

    if (index === -1) {
      selectedIds.push(tag.id);
      const updatedTags = [...this.selectedTags(), tag];
      this.selectedTags.set(updatedTags);
    } else {
      selectedIds.splice(index, 1);
      const updatedTags = this.selectedTags().filter((t) => t.id !== tag.id);
      this.selectedTags.set(updatedTags);
    }

    this.selectedTagIds.set(selectedIds);
    this.onChange(selectedIds);
  }

  isTagSelected(tagId: string): boolean {
    return this.selectedTagIds().includes(tagId);
  }

  clearAllTags(event: Event): void {
    event.stopPropagation();
    this.selectedTagIds.set([]);
    this.selectedTags.set([]);
    this.onChange([]);
  }

  removeTag(tagId: string, event: Event): void {
    event.stopPropagation();
    const selectedIds = this.selectedTagIds().filter((id) => id !== tagId);
    const selectedTagsList = this.selectedTags().filter((tag) => tag.id !== tagId);

    this.selectedTagIds.set(selectedIds);
    this.selectedTags.set(selectedTagsList);
    this.onChange(selectedIds);
  }

  showCreateTagModal(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();

    const modalRef = this.dialog.open<TagResponse>(CreateUpdateTagModal, {
      width: '400px',
    });

    modalRef.closed
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: TagResponse | undefined) => {
        if (response) {
          this.reloadTags();

          this.addNewlyCreatedTag(response);
        }
      });
  }

  private addNewlyCreatedTag(tag: TagResponse): void {
    const newTag: Tag = {
      id: tag.id,
      name: tag.name,
      color: tag.color!,
    };

    const selectedIds = [...this.selectedTagIds(), tag.id];
    const selectedTagsList = [...this.selectedTags(), newTag];

    this.selectedTagIds.set(selectedIds);
    this.selectedTags.set(selectedTagsList);
    this.onChange(selectedIds);
  }

  private reloadTags(): void {
    this.refreshTrigger.next(true);
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

  onOptionKeydown(event: KeyboardEvent, tag: Tag, index: number): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.toggleTag(tag);
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
    this.filteredTags$.pipe(take(1), takeUntil(this.destroy$)).subscribe((tags: Tag[]) => {
      if (tags.length === 0) return;

      if (index < 0) {
        index = tags.length - 1;
      } else if (index >= tags.length) {
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

  writeValue(value: string[] | null): void {
    if (value && Array.isArray(value)) {
      this.selectedTagIds.set(value);

      this.pendingSelection.next(value);

      this.allTags$.pipe(take(1), takeUntil(this.destroy$)).subscribe((tags) => {
        const selectedTags = tags.filter((tag) => value.includes(tag.id));
        this.selectedTags.set(selectedTags);
      });
    } else {
      this.selectedTagIds.set([]);
      this.selectedTags.set([]);
      this.pendingSelection.next([]);
    }
  }

  registerOnChange(fn: (value: string[]) => void): void {
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
