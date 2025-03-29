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
import { debounceTime, Subject, take } from 'rxjs';
import { TagBadgeComponent } from '../../../components/badges/tag-badge/tag-badge.component';
import { ButtonComponent } from '../../../components/buttons/button/button.component';
import { ListFilterTextInputComponent } from '../../../components/forms/list-filter-text-input/list-filter-text-input.component';
import { CreateUpdateBucketListItemComponent } from '../../../components/modals/bucketList/create-update-bucket-list-item/create-update-bucket-list-item.component';
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
import { BucketListItem, BucketListItemFilterRequest } from '../../../models/bucket-list.model';
import { ListViewMode } from '../../../models/enums/list-view-mode.enum';
import { SortField } from '../../../models/page-options.model';
import { PaginatedResult } from '../../../models/pagination.model';
import { BucketListService } from '../../../services/bucket-list.service';
import { PreferenceKeys, UserPreferencesService } from '../../../services/user-preferences.service';
import { UserDateFormatPipe } from '../../../shared/pipes/user-date-format.pipe';

@Component({
  selector: 'ts-bucket-list-items',
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
  ],
  providers: [DatePipe],
  templateUrl: './bucket-list-items.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BucketListItemsPage implements OnInit, OnDestroy {
  // ─── Services ────────────────────────────────────────────────────────────────
  private bucketListService = inject(BucketListService);
  private userPrefService = inject(UserPreferencesService);
  private dialog = inject(Dialog);
  private destroyRef = inject(DestroyRef);

  // ─── Local Component State (Signals & Subjects) ─────────────────────────────
  currentPage = signal<number>(1);
  searchTerm = signal<string>('');
  selectedSortBy = signal<string>('name');
  selectedSortOrder = signal<'asc' | 'desc'>('asc');
  selectedViewMode = signal<ListViewMode>(ListViewMode.Table);
  selectedFields = signal<Set<string>>(new Set(['name', 'description', 'startDate']));
  displayedItems = signal<BucketListItem[]>([]);
  pageSize = signal<number>(25);
  totalCount = signal<number>(0);
  private filterInput$ = new Subject<string>();

  // ─── UI Options & Configurations ──────────────────────────────────────────────
  userPreferencesKey = PreferenceKeys.PageBucketList;

  fieldOptions = [
    { id: 'name', label: 'Name' },
    { id: 'description', label: 'Description' },
    { id: 'tags', label: 'Tags' },
    { id: 'startDate', label: 'Start Date' },
    { id: 'endDate', label: 'End Date' },
    { id: 'createdAt', label: 'Created Date' },
    { id: 'lastModifiedAt', label: 'Last Modified Date' },
  ];

  sortFields: SortField[] = [
    { field: 'name', name: 'Name', type: 'text' },
    { field: 'startDate', name: 'Start Date', type: 'text' },
    { field: 'endDate', name: 'End Date', type: 'text' },
    { field: 'createdAt', name: 'Created Date', type: 'number' },
    { field: 'lastModifiedAt', name: 'Last Modified Date', type: 'number' },
  ];

  columns: ColumnConfig<BucketListItem>[] = [];

  itemsCount = linkedSignal(() => Number(this.bucketListResource.value()?.items?.length || 0));
  activeFilters = computed(() => this.searchTerm().trim().length > 0);
  isLoading = linkedSignal(() => this.bucketListResource.isLoading());

  // ─── Data Loading (Resource) ──────────────────────────────────────────────────
  bucketListResource = rxResource({
    defaultValue: {
      items: [] as BucketListItem[],
      totalCount: 0,
    } as PaginatedResult<BucketListItem>,
    request: () => this.buildFilterRequest(),
    loader: ({ request }) => this.bucketListService.getBucketListItems(request),
  });

  // ─── Template References for Custom Cell Templates ───────────────────────────
  createdAtCell = viewChild<TemplateRef<any>>('createdAtCell');
  lastModifiedAtCell = viewChild<TemplateRef<any>>('lastModifiedAtCell');
  startDateCell = viewChild<TemplateRef<any>>('startDateCell');
  endDateCell = viewChild<TemplateRef<any>>('endDateCell');
  tagsCell = viewChild<TemplateRef<any>>('tagsCell');

  createdAtStackLabel = viewChild<TemplateRef<any>>('createdAtStackLabel');
  lastModifiedAtStackLabel = viewChild<TemplateRef<any>>('lastModifiedAtStackLabel');
  startDateStackLabel = viewChild<TemplateRef<any>>('startDateStackLabel');
  endDateStackLabel = viewChild<TemplateRef<any>>('endDateStackLabel');
  tagsStackCell = viewChild<TemplateRef<any>>('tagsStackCell');

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
      const resource = this.bucketListResource.value();
      if (resource && !this.bucketListResource.isLoading()) {
        this.displayedItems.set(resource.items || []);
        this.totalCount.set(resource.totalCount || 0);
      }
    });
  }

  // ─── Angular Lifecycle Hooks ───────────────────────────────────────────────────
  ngOnInit(): void {
    this.columns = [
      { key: 'name', header: 'Name' },
      { key: 'description', header: 'Description', sortable: false },
      {
        key: 'tags',
        header: 'Tags',
        sortable: false,
        cellTemplate: this.tagsCell(),
        stackLabelTemplate: this.tagsStackCell(),
      },
      {
        key: 'startDate',
        header: 'Start Date',
        sortable: true,
        cellTemplate: this.startDateCell(),
        stackLabelTemplate: this.startDateStackLabel(),
      },
      {
        key: 'endDate',
        header: 'End Date',
        sortable: true,
        cellTemplate: this.endDateCell(),
        stackLabelTemplate: this.endDateStackLabel(),
      },
      {
        key: 'createdAt',
        header: 'Created At',
        cellTemplate: this.createdAtCell(),
        stackLabelTemplate: this.createdAtStackLabel(),
      },
      {
        key: 'lastModifiedAt',
        header: 'Last Modified At',
        cellTemplate: this.lastModifiedAtCell(),
        stackLabelTemplate: this.lastModifiedAtStackLabel(),
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
      this.bucketListResource.reload();
    });
  }

  private buildFilterRequest(): BucketListItemFilterRequest {
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
    this.bucketListResource.reload();
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
    this.bucketListResource.reload();
  }

  showCreateModal(): void {
    const dialogRef = this.dialog.open(CreateUpdateBucketListItemComponent, {
      width: '900px',
      hasBackdrop: true,
      data: {},
    });

    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.bucketListResource.reload();
      }
    });
  }

  showUpdateModal(bucketListItem: BucketListItem): void {
    const dialogRef = this.dialog.open(CreateUpdateBucketListItemComponent, {
      width: '900px',
      data: { bucketListItem },
    });

    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.bucketListResource.reload();
      }
    });
  }

  showDeleteModal(): void {
    console.log('Delete bucket list item');
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.bucketListResource.reload();
  }

  // ─── Expose Enums to the Template ──────────────────────────────────────────────
  protected readonly ListViewMode = ListViewMode;
}
