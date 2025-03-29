import { Dialog } from '@angular/cdk/dialog';
import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  linkedSignal,
  OnDestroy,
  OnInit,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { debounceTime, Subject, take } from 'rxjs';
import { TagBadgeComponent } from '../../../components/badges/tag-badge/tag-badge.component';
import { ButtonComponent } from '../../../components/buttons/button/button.component';
import { ListFilterTextInputComponent } from '../../../components/forms/list-filter-text-input/list-filter-text-input.component';
import { CreateUpdateTagModal } from '../../../components/modals/tags/create-update-tag/create-update-tag.modal';
import { FieldDisplaySelectorComponent } from '../../../components/tools/field-display-selector/field-display-selector.component';
import { SortOptionsComponent } from '../../../components/tools/sort-options/sort-options.component';
import { StickyListToolsComponent } from '../../../components/tools/sticky-list-tools/sticky-list-tools.component';
import { ViewModeToogleComponent } from '../../../components/tools/view-mode-toogle/view-mode-toogle.component';
import { EmptyContentComponent } from '../../../components/ui/empty-content/empty-content.component';
import { PageHeaderComponent } from '../../../components/ui/page-header/page-header.component';
import { PaginationComponent } from '../../../components/ui/pagination/pagination.component';
import { StackListViewMode } from '../../../components/viewModes/stack-list/stack-list.view-mode';
import {
  ColumnConfig,
  TableListViewMode,
} from '../../../components/viewModes/table-list/table-list.view-mode';
import { ListViewMode } from '../../../models/enums/list-view-mode.enum';
import { SortField } from '../../../models/page-options.model';
import { PaginatedResult } from '../../../models/pagination.model';
import { TagFilterRequest, TagResponse } from '../../../models/tags.model';
import { TagService } from '../../../services/tag.service';
import { PreferenceKeys, UserPreferencesService } from '../../../services/user-preferences.service';
import { UserDateFormatPipe } from '../../../shared/pipes/user-date-format.pipe';

@Component({
  selector: 'ts-tags-list',
  imports: [
    PageHeaderComponent,
    EmptyContentComponent,
    ButtonComponent,
    ViewModeToogleComponent,
    SortOptionsComponent,
    FieldDisplaySelectorComponent,
    ListFilterTextInputComponent,
    TableListViewMode,
    UserDateFormatPipe,
    StackListViewMode,
    TagBadgeComponent,
    StickyListToolsComponent,
    PaginationComponent,
    RouterLink,
  ],
  providers: [DatePipe],
  templateUrl: './tags-list.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagsListPage implements OnInit, OnDestroy {
  // ─── Services ────────────────────────────────────────────────────────────────
  private tagService = inject(TagService);
  private userPrefService = inject(UserPreferencesService);
  private dialog = inject(Dialog);
  private destroyRef = inject(DestroyRef);

  // ─── Local Component State (Signals & Subjects) ─────────────────────────────
  currentPage = signal<number>(1);
  searchTerm = signal<string>('');
  selectedSortBy = signal<string>('name');
  selectedSortOrder = signal<'asc' | 'desc'>('asc');
  selectedViewMode = signal<ListViewMode>(ListViewMode.Table);
  selectedFields = signal<Set<string>>(new Set(['name', 'color']));
  displayedItems = signal<TagResponse[]>([]);
  pageSize = signal<number>(25);
  totalCount = signal<number>(0);
  private filterInput$ = new Subject<string>();

  // ─── UI Options & Configurations ──────────────────────────────────────────────
  userPreferencesKey = PreferenceKeys.PageTags;

  fieldOptions = [
    { id: 'name', label: 'Name' },
    { id: 'color', label: 'Color' },
    { id: 'journeysCount', label: 'Journeys' },
    { id: 'bucketListItemCount', label: 'Bucket List Items' },
    { id: 'createdAt', label: 'Created Date' },
    { id: 'lastModifiedAt', label: 'Last Modified Date' },
  ];

  sortFields: SortField[] = [
    { field: 'name', name: 'Name', type: 'text' },
    { field: 'journeysCount', name: 'Journeys', type: 'number' },
    { field: 'bucketListItemCount', name: 'Bucket List Items', type: 'number' },
    { field: 'createdAt', name: 'Created Date', type: 'number' },
    { field: 'lastModifiedAt', name: 'Last Modified Date', type: 'number' },
  ];

  columns: ColumnConfig<TagResponse>[] = [];

  itemsCount = linkedSignal(() => Number(this.tagsResource.value()?.items?.length || 0));
  activeFilters = computed(() => this.searchTerm().trim().length > 0);
  isLoading = linkedSignal(() => this.tagsResource.isLoading());

  // ─── Data Loading (Resource) ──────────────────────────────────────────────────
  tagsResource = rxResource({
    defaultValue: {
      items: [] as TagResponse[],
      totalCount: 0,
    } as PaginatedResult<TagResponse>,
    request: () => this.buildFilterRequest(),
    loader: ({ request }) => this.tagService.getTags(request),
  });

  // ─── Template References for Custom Cell Templates ───────────────────────────
  createdAtCell = viewChild<TemplateRef<TagResponse>>('createdAtCell');
  lastModifiedAtCell = viewChild<TemplateRef<TagResponse>>('lastModifiedAtCell');
  colorAtCell = viewChild<TemplateRef<TagResponse>>('colorAtCell');
  nameCell = viewChild<TemplateRef<TagResponse>>('nameCell');
  journeysCountAtStackCell = viewChild<TemplateRef<TagResponse>>('journeysCountAtStackCell');
  bucketListItemCountAtStackCell = viewChild<TemplateRef<TagResponse>>(
    'bucketListItemCountAtStackCell',
  );

  // ─── Constructor ─────────────────────────────────────────────────────────────
  constructor() {
    const pagePrefs$ = this.userPrefService.getPagePreferences(this.userPreferencesKey, {
      viewMode: this.selectedViewMode(),
      sortBy: this.selectedSortBy(),
      sortOrder: this.selectedSortOrder(),
      selectedFields: Array.from(this.selectedFields()),
    });
    pagePrefs$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((prefs) => {
      this.selectedViewMode.set(prefs.viewMode);
      this.selectedSortBy.set(prefs.sortBy);
      this.selectedSortOrder.set(prefs.sortOrder);
      this.selectedFields.set(new Set(prefs.selectedFields));
    });

    this.initFilterDebounce();

    effect(() => {
      const resource = this.tagsResource.value();
      if (resource && !this.tagsResource.isLoading()) {
        this.displayedItems.set(resource.items || []);
        this.totalCount.set(resource.totalCount || 0);
      }
    });
  }

  // ─── Angular Lifecycle Hooks ───────────────────────────────────────────────────
  ngOnInit(): void {
    this.columns = [
      {
        key: 'name',
        header: 'Name',
        cellTemplate: this.nameCell(),
      },
      { key: 'color', header: 'Color', cellTemplate: this.colorAtCell() },
      {
        key: 'journeysCount',
        header: 'Journeys',
        stackLabelTemplate: this.journeysCountAtStackCell(),
      },
      {
        key: 'bucketListItemCount',
        header: 'Bucket List Items',
        stackLabelTemplate: this.bucketListItemCountAtStackCell(),
      },
      { key: 'createdAt', header: 'Created At', cellTemplate: this.createdAtCell() },
      {
        key: 'lastModifiedAt',
        header: 'Last Modified At',
        cellTemplate: this.lastModifiedAtCell(),
      },
    ];

    this.userPrefService
      .getPreference<number>(PreferenceKeys.ItemsPerPage, 25)
      .pipe(take(1))
      .subscribe((size) => this.pageSize.set(size));
  }

  ngOnDestroy(): void {
    this.filterInput$.complete();
  }

  // ─── Private Methods ───────────────────────────────────────────────────────────
  private initFilterDebounce(): void {
    this.filterInput$.pipe(debounceTime(400)).subscribe((term: string) => {
      this.searchTerm.set(term);
      this.tagsResource.reload();
    });
  }

  private buildFilterRequest(): TagFilterRequest {
    return {
      page: this.currentPage(),
      pageSize: this.pageSize(),
      searchTerm: this.searchTerm(),
      sortBy: this.selectedSortBy(),
      sortOrder: this.selectedSortOrder(),
    };
  }

  // ─── Public Event Handlers ──────────────────────────────────────────────────────
  onFilterInputChange(filterValue: string): void {
    this.filterInput$.next(filterValue);
  }

  onSortChange(event: { sortBy: string; sortDirection?: 'asc' | 'desc' }): void {
    let sortDirection: 'asc' | 'desc';
    if (this.selectedSortBy() === event.sortBy) {
      sortDirection = this.selectedSortOrder() === 'asc' ? 'desc' : 'asc';
    } else {
      sortDirection = event.sortDirection ?? 'asc';
    }

    this.selectedSortBy.set(event.sortBy);
    this.selectedSortOrder.set(sortDirection);
    this.userPrefService.setPagePreferences(this.userPreferencesKey, {
      sortBy: event.sortBy,
      sortOrder: sortDirection,
    });
    this.tagsResource.reload();
  }

  onViewModeChange(mode: ListViewMode): void {
    this.selectedViewMode.set(mode);
    this.userPrefService.setPagePreferences(this.userPreferencesKey, { viewMode: mode });
  }

  onFieldSelectionChange(fields: Set<string>): void {
    this.selectedFields.set(fields);
    this.userPrefService.setPagePreferences(this.userPreferencesKey, {
      selectedFields: Array.from(fields),
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.tagsResource.reload();
  }

  showCreateModal(): void {
    const dialogRef = this.dialog.open(CreateUpdateTagModal, {
      width: '400px',
      hasBackdrop: true,
      data: {},
    });

    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.tagsResource.reload();
      }
    });
  }

  showUpdateModal(tag: TagResponse): void {
    const dialogRef = this.dialog.open(CreateUpdateTagModal, {
      width: '400px',
      hasBackdrop: true,
      data: { tag: tag },
    });

    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.tagsResource.reload();
      }
    });
  }

  showDeleteModal(): void {
    console.log('Delete tag');
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.tagsResource.reload();
  }

  // ─── Expose Enums to the Template ──────────────────────────────────────────────
  protected readonly ListViewMode = ListViewMode;
}
