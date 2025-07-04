import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { finalize } from 'rxjs';
import {
  BucketListItem,
  BucketListItemFilterRequest,
  BucketListItemType,
} from '../../../models/bucket-list.model';
import { BucketListService } from '../../../services/bucket-list.service';
import { ResponsiveService } from '../../../services/responsive.service';
import { ButtonComponent } from '../../buttons/button/button.component';
import { LoadingIndicatorComponent } from '../../ui/loading-indicator/loading-indicator.component';
import { BaseModalComponent } from '../../modals/base-modal/base-modal.component';
import { TextInputComponent } from '../text-input/text-input.component';

export interface BucketListPickerConfig {
  mode: 'move' | 'copy';
  allowMultiple: boolean;
  filterTypes?: BucketListItemType[];
  excludeItemIds?: string[];
  journeyId: string;
}

export interface BucketListPickerResult {
  items: BucketListItem[];
  action: 'move' | 'copy';
}

@Component({
  selector: 'ts-bucket-list-picker',
  imports: [
    BaseModalComponent,
    ButtonComponent,
    TextInputComponent,
    FontAwesomeModule,
    LoadingIndicatorComponent,
    FormsModule,
    NgClass,
  ],
  templateUrl: './bucket-list-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BucketListPickerComponent implements OnInit {
  private dialogRef = inject(DialogRef<BucketListPickerResult>);
  dialogData = inject<BucketListPickerConfig>(DIALOG_DATA);
  private bucketListService = inject(BucketListService);
  public responsiveService = inject(ResponsiveService);

  // State
  items = signal<BucketListItem[]>([]);
  selectedItems = signal<Set<string>>(new Set());
  selectedPreviewItem = signal<BucketListItem | null>(null);
  isLoading = signal(false);
  searchTerm = signal('');
  selectedType = signal<BucketListItemType | 'all'>('all');
  totalItems = signal(0);
  currentPage = signal(1);
  pageSize = 20;

  // Computed
  modalTitle = computed(() => {
    const action = this.dialogData.mode === 'move' 
      ? 'Move to Journey' 
      : 'Copy to Journey';
    return `Select Bucket List Items - ${action}`;
  });

  filteredItems = computed(() => {
    const items = this.items();
    const excludeIds = this.dialogData.excludeItemIds || [];
    return items.filter(item => !excludeIds.includes(item.id));
  });

  selectedCount = computed(() => this.selectedItems().size);

  canConfirm = computed(() => this.selectedCount() > 0);

  // Type options for filter
  typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: BucketListItemType.Destination, label: 'Destination' },
    { value: BucketListItemType.Activity, label: 'Activity' },
    { value: BucketListItemType.Accommodation, label: 'Accommodation' },
    { value: BucketListItemType.Food, label: 'Food' },
    { value: BucketListItemType.Transportation, label: 'Transportation' },
    { value: BucketListItemType.Event, label: 'Event' },
    { value: BucketListItemType.Other, label: 'Other' },
  ];

  ngOnInit() {
    this.loadItems();
  }

  loadItems(resetPage = true) {
    if (resetPage) {
      this.currentPage.set(1);
    }

    const filters: BucketListItemFilterRequest = {
      page: this.currentPage(),
      pageSize: this.pageSize,
      searchTerm: this.searchTerm() || undefined,
      types: this.selectedType() !== 'all' 
        ? [this.selectedType() as BucketListItemType] 
        : this.dialogData.filterTypes,
    };

    this.isLoading.set(true);
    this.bucketListService
      .getBucketListItems(filters)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (result) => {
          if (resetPage) {
            this.items.set(result.items);
          } else {
            // Append for infinite scroll
            this.items.update(items => [...items, ...result.items]);
          }
          this.totalItems.set(result.totalCount);
        },
        error: (error) => {
          console.error('Error loading bucket list items:', error);
        },
      });
  }

  onSearchChange() {
    this.loadItems();
  }

  onTypeChange() {
    this.loadItems();
  }

  selectItem(item: BucketListItem) {
    this.selectedPreviewItem.set(item);

    if (!this.dialogData.allowMultiple) {
      // Single selection mode
      this.selectedItems.set(new Set([item.id]));
    }
  }

  toggleItemSelection(item: BucketListItem, event?: Event) {
    event?.stopPropagation();

    if (!this.dialogData.allowMultiple) {
      this.selectItem(item);
      return;
    }

    const selected = new Set(this.selectedItems());
    if (selected.has(item.id)) {
      selected.delete(item.id);
    } else {
      selected.add(item.id);
    }
    this.selectedItems.set(selected);
  }

  isItemSelected(item: BucketListItem): boolean {
    return this.selectedItems().has(item.id);
  }

  onScroll(event: Event) {
    const element = event.target as HTMLElement;
    if (element.scrollTop + element.clientHeight >= element.scrollHeight - 100) {
      if (this.items().length < this.totalItems() && !this.isLoading()) {
        this.currentPage.update(p => p + 1);
        this.loadItems(false);
      }
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  confirm() {
    const selectedIds = Array.from(this.selectedItems());
    const selectedItems = this.items().filter(item => selectedIds.includes(item.id));
    
    this.dialogRef.close({
      items: selectedItems,
      action: this.dialogData.mode,
    });
  }

  getTypeIcon(type: BucketListItemType): any {
    const icons: Record<BucketListItemType, string> = {
      [BucketListItemType.Destination]: 'location-dot',
      [BucketListItemType.Activity]: 'person-running',
      [BucketListItemType.Accommodation]: 'bed',
      [BucketListItemType.Food]: 'utensils',
      [BucketListItemType.Transportation]: 'car',
      [BucketListItemType.Event]: 'calendar-days',
      [BucketListItemType.Other]: 'ellipsis',
    };
    return ['fas', icons[type] || 'ellipsis'] as any;
  }

  formatPrice(price?: number, currency?: string): string {
    if (!price || !currency) return '';
    
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currency,
      }).format(price);
    } catch {
      return `${currency} ${price}`;
    }
  }

  // Keyboard navigation
  handleKeyDown(event: KeyboardEvent, index: number) {
    const items = this.filteredItems();
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (index < items.length - 1) {
          this.focusItem(index + 1);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (index > 0) {
          this.focusItem(index - 1);
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.selectItem(items[index]);
        break;
    }
  }

  private focusItem(index: number) {
    const element = document.querySelector(
      `[data-item-index="${index}"]`
    ) as HTMLElement;
    element?.focus();
  }

  getModeActionLabel(): string {
    return this.dialogData.mode === 'move' ? 'Move to Journey' : 'Copy to Journey';
  }

  getModeConfirmLabel(): string {
    return this.dialogData.mode === 'move' ? 'Move Selected' : 'Copy Selected';
  }

  getTypeLabel(type: BucketListItemType): string {
    const option = this.typeOptions.find(t => t.value === type);
    return option?.label || 'Other';
  }
}