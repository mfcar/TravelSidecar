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
import { debounceTime, Subject } from 'rxjs';
import { ButtonComponent } from '../../../components/buttons/button/button.component';
import { ListFilterTextInputComponent } from '../../../components/forms/list-filter-text-input/list-filter-text-input.component';
import { CreateUpdateUserModal } from '../../../components/modals/users/create-update-user/create-update-user.modal';
import { FieldDisplaySelectorComponent } from '../../../components/tools/field-display-selector/field-display-selector.component';
import { SortOptionsComponent } from '../../../components/tools/sort-options/sort-options.component';
import { ViewModeToogleComponent } from '../../../components/tools/view-mode-toogle/view-mode-toogle.component';
import { EmptyContentComponent } from '../../../components/ui/empty-content/empty-content.component';
import { ListStatusComponent } from '../../../components/ui/list-status/list-status.component';
import { PageHeaderComponent } from '../../../components/ui/page-header/page-header.component';
import { StackListViewMode } from '../../../components/viewModes/stack-list/stack-list.view-mode';
import {
  ColumnConfig,
  TableListViewMode,
} from '../../../components/viewModes/table-list/table-list.view-mode';
import { ListViewMode } from '../../../models/enums/list-view-mode.enum';
import { SortField } from '../../../models/page-options.model';
import { PaginatedResult } from '../../../models/pagination.model';
import { User, UserFilterRequest } from '../../../models/user.model';
import { PreferenceKeys, UserPreferencesService } from '../../../services/user-preferences.service';
import { UserService } from '../../../services/user.service';
import { UserDateFormatPipe } from '../../../shared/pipes/user-date-format.pipe';

@Component({
  selector: 'ts-users-list',
  imports: [
    PageHeaderComponent,
    EmptyContentComponent,
    ButtonComponent,
    ViewModeToogleComponent,
    SortOptionsComponent,
    FieldDisplaySelectorComponent,
    ListStatusComponent,
    ListFilterTextInputComponent,
    TableListViewMode,
    UserDateFormatPipe,
    StackListViewMode,
  ],
  providers: [DatePipe],
  templateUrl: './users-list.page.html',
  styleUrl: './users-list.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersListPage implements OnInit, OnDestroy {
  // ─── Services ────────────────────────────────────────────────────────────────
  private userService = inject(UserService);
  private userPrefService = inject(UserPreferencesService);
  private dialog = inject(Dialog);
  private destroyRef = inject(DestroyRef);

  // ─── Local Component State (Signals & Subjects) ─────────────────────────────
  currentPage = signal<number>(1);
  searchTerm = signal<string>('');
  selectedSortBy = signal<string>('username');
  selectedSortOrder = signal<'asc' | 'desc'>('asc');
  selectedViewMode = signal<ListViewMode>(ListViewMode.Table);
  selectedFields = signal<Set<string>>(new Set(['username', 'email', 'lastActiveAt']));
  displayedItems = signal<User[]>([]);
  private filterInput$ = new Subject<string>();

  // ─── UI Options & Configurations ──────────────────────────────────────────────
  userPreferencesKey = PreferenceKeys.PageUsers;

  fieldOptions = [
    { id: 'username', label: 'Username' },
    { id: 'email', label: 'Email' },
    { id: 'createdAt', label: 'Created Date' },
    { id: 'lastModifiedAt', label: 'Last Modified Date' },
    { id: 'lastActiveAt', label: 'Last Active Date' },
  ];

  sortFields: SortField[] = [
    { field: 'username', name: 'Username', type: 'text' },
    { field: 'email', name: 'Email', type: 'text' },
    { field: 'createdAt', name: 'Created Date', type: 'number' },
    { field: 'lastModifiedAt', name: 'Last Modified Date', type: 'number' },
    { field: 'lastActiveAt', name: 'Last Active Date', type: 'number' },
  ];

  columns: ColumnConfig<User>[] = [];

  itemsCount = linkedSignal(() => Number(this.usersResource.value()?.items?.length || 0));
  activeFilters = computed(() => this.searchTerm().trim().length > 0);
  isLoading = linkedSignal(() => this.usersResource.isLoading());

  // ─── Data Loading (Resource) ──────────────────────────────────────────────────
  usersResource = rxResource({
    defaultValue: {
      items: [] as User[],
      totalCount: 0,
    } as PaginatedResult<User>,
    request: () => this.buildFilterRequest(),
    loader: ({ request }) => this.userService.getUsers(request),
  });

  // ─── Template References for Custom Cell Templates ───────────────────────────
  createdAtCell = viewChild<TemplateRef<any>>('createdAtCell');
  lastModifiedAtCell = viewChild<TemplateRef<any>>('lastModifiedAtCell');
  lastActiveAtCell = viewChild<TemplateRef<any>>('lastActiveAtCell');

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
      const resource = this.usersResource.value();
      if (resource && !this.usersResource.isLoading()) {
        this.displayedItems.set(resource.items || []);
      }
    });
  }

  // ─── Angular Lifecycle Hooks ───────────────────────────────────────────────────
  ngOnInit(): void {
    this.columns = [
      { key: 'username', header: 'Username' },
      { key: 'email', header: 'Email' },
      { key: 'createdAt', header: 'Created At', cellTemplate: this.createdAtCell() },
      {
        key: 'lastModifiedAt',
        header: 'Last Modified At',
        cellTemplate: this.lastModifiedAtCell(),
      },
      { key: 'lastActiveAt', header: 'Last Active At', cellTemplate: this.lastActiveAtCell() },
    ];
  }

  ngOnDestroy(): void {
    this.filterInput$.complete();
  }

  // ─── Private Methods ───────────────────────────────────────────────────────────
  private initFilterDebounce(): void {
    this.filterInput$.pipe(debounceTime(400)).subscribe((term: string) => {
      this.searchTerm.set(term);
      this.usersResource.reload();
    });
  }

  private buildFilterRequest(): UserFilterRequest {
    return {
      page: this.currentPage(),
      pageSize: 25,
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
    this.usersResource.reload();
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
    this.usersResource.reload();
  }

  showCreateModal(): void {
    const dialogRef = this.dialog.open(CreateUpdateUserModal, {
      width: '500px',
      hasBackdrop: true,
      data: {},
    });

    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.usersResource.reload();
      }
    });
  }

  showUpdateModal(user: User): void {
    const dialogRef = this.dialog.open(CreateUpdateUserModal, {
      width: '500px',
      hasBackdrop: true,
      data: { user: user },
    });

    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.usersResource.reload();
      }
    });
  }

  showDeleteModal(): void {
    console.log('Delete tag');
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.usersResource.reload();
  }

  // ─── Expose Enums to the Template ──────────────────────────────────────────────
  protected readonly ListViewMode = ListViewMode;
}
