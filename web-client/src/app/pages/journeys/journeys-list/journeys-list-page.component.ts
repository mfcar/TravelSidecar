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
import { CreateUpdateJourneyModal } from '../../../components/modals/journeys/create-update-journey/create-update-journey-modal.component';
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
import { Journey, JourneysFilterRequest } from '../../../models/journeys.model';
import { SortField } from '../../../models/page-options.model';
import { PaginatedResult } from '../../../models/pagination.model';
import { JourneyService } from '../../../services/journey.service';
import { PreferenceKeys, UserPreferencesService } from '../../../services/user-preferences.service';
import { UserDateFormatPipe } from '../../../shared/pipes/user-date-format.pipe';

@Component({
  selector: 'ts-journeys-list',
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
  templateUrl: './journeys-list-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JourneysListPage implements OnInit, OnDestroy {
  // ─── Services ────────────────────────────────────────────────────────────────
  private JourneyService = inject(JourneyService);
  private userPrefService = inject(UserPreferencesService);
  private dialog = inject(Dialog);
  private destroyRef = inject(DestroyRef);

  // ─── Local Component State (Signals & Subjects) ─────────────────────────────
  currentPage = signal<number>(1);
  searchTerm = signal<string>('');
  selectedSortBy = signal<string>('name');
  selectedSortOrder = signal<'asc' | 'desc'>('asc');
  selectedViewMode = signal<ListViewMode>(ListViewMode.Table);
  selectedFields = signal<Set<string>>(new Set(['name', 'description', 'categoryName']));
  displayedItems = signal<Journey[]>([]);
  pageSize = signal<number>(25);
  totalCount = signal<number>(0);
  private filterInput$ = new Subject<string>();

  // ─── UI Options & Configurations ──────────────────────────────────────────────
  userPreferencesKey = PreferenceKeys.PageJourneys;

  fieldOptions = [
    { id: 'name', label: 'Name' },
    { id: 'description', label: 'Description' },
    { id: 'categoryName', label: 'Category' },
    { id: 'tags', label: 'Tags' },
    { id: 'createdAt', label: 'Created Date' },
    { id: 'lastModifiedAt', label: 'Last Modified Date' },
  ];

  sortFields: SortField[] = [
    { field: 'name', name: 'Name', type: 'text' },
    { field: 'createdAt', name: 'Created Date', type: 'number' },
    { field: 'lastModifiedAt', name: 'Last Modified Date', type: 'number' },
  ];

  columns: ColumnConfig<Journey>[] = [];

  itemsCount = linkedSignal(() => Number(this.journeysResource.value().items.length || 0));
  activeFilters = computed(() => this.searchTerm().trim().length > 0);
  isLoading = linkedSignal(() => this.journeysResource.isLoading());

  // ─── Data Loading (Resource) ──────────────────────────────────────────────────
  journeysResource = rxResource({
    defaultValue: { items: [] as Journey[], totalCount: 0 } as PaginatedResult<Journey>,
    request: () => this.buildFilterRequest(),
    loader: ({ request }) => this.JourneyService.getJourneys(request),
  });

  // ─── Template References for Custom Cell Templates ───────────────────────────
  createdAtCell = viewChild<TemplateRef<Journey>>('createdAtCell');
  lastModifiedAtCell = viewChild<TemplateRef<Journey>>('lastModifiedAtCell');
  tagsAtCell = viewChild<TemplateRef<Journey>>('tagsAtCell');
  tagsAtStackCell = viewChild<TemplateRef<Journey>>('tagsAtStackCell');
  categoryAtCell = viewChild<TemplateRef<any>>('categoryAtCell');
  categoryAtStackCell = viewChild<TemplateRef<any>>('categoryAtStackCell');

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
      const resource = this.journeysResource.value();
      if (resource && !this.journeysResource.isLoading()) {
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
        key: 'categoryName',
        header: 'Category',
        sortable: false,
        cellTemplate: this.categoryAtCell(),
        stackLabelTemplate: this.categoryAtStackCell(),
      },
      { key: 'tags', header: 'Tags', sortable: false, cellTemplate: this.tagsAtCell() },
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
      this.journeysResource.reload();
    });
  }

  private buildFilterRequest(): JourneysFilterRequest {
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
    this.journeysResource.reload();
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
    this.journeysResource.reload();
  }

  showCreateModal(): void {
    const dialogRef = this.dialog.open(CreateUpdateJourneyModal, {
      data: {},
    });

    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.journeysResource.reload();
      }
    });
  }

  showUpdateModal(journey: Journey): void {
    const dialogRef = this.dialog.open(CreateUpdateJourneyModal, {
      data: { journey: journey },
    });

    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.journeysResource.reload();
      }
    });
  }

  showDeleteModal(): void {
    console.log('Delete journey');
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.journeysResource.reload();
  }

  // ─── Expose Enums to the Template ──────────────────────────────────────────────
  protected readonly ListViewMode = ListViewMode;
}
