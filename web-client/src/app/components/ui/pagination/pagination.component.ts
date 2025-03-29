import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ButtonComponent } from '../../buttons/button/button.component';
import { LoadingIndicatorComponent } from '../loading-indicator/loading-indicator.component';

@Component({
  selector: 'ts-pagination',
  imports: [CommonModule, ButtonComponent, LoadingIndicatorComponent, FontAwesomeModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  // Input signals
  totalItems = input.required<number>();
  currentPage = input.required<number>();
  itemsPerPage = input.required<number>();
  isLoading = input<boolean>(false);
  isFiltered = input<boolean>(false);

  // Output signals
  pageChange = output<number>();
  resetFilter = output<void>();

  // Computed values
  totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.totalItems() / this.itemsPerPage()));
  });

  showingStart = computed(() => {
    if (this.totalItems() === 0) return 0;
    return (this.currentPage() - 1) * this.itemsPerPage() + 1;
  });

  showingEnd = computed(() => {
    return Math.min(this.currentPage() * this.itemsPerPage(), this.totalItems());
  });

  visiblePages = computed(() => {
    const totalPages = this.totalPages();
    const currentPage = this.currentPage();

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    let pages: (number | 'ellipsis')[] = [];

    pages.push(1);

    if (currentPage <= 3) {
      pages = pages.concat([2, 3, 4, 5, 'ellipsis', totalPages]);
    } else if (currentPage >= totalPages - 2) {
      pages = pages.concat([
        'ellipsis',
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ]);
    } else {
      pages = pages.concat([
        'ellipsis',
        currentPage - 1,
        currentPage,
        currentPage + 1,
        'ellipsis',
        totalPages,
      ]);
    }

    return pages;
  });

  onPageClick(page: number | 'ellipsis'): void {
    if (typeof page === 'number' && page !== this.currentPage()) {
      this.pageChange.emit(page);
    }
  }

  onPreviousClick(): void {
    if (this.currentPage() > 1) {
      this.pageChange.emit(this.currentPage() - 1);
    }
  }

  onNextClick(): void {
    if (this.currentPage() < this.totalPages()) {
      this.pageChange.emit(this.currentPage() + 1);
    }
  }

  onResetFilters(): void {
    this.resetFilter.emit();
  }

  isEllipsis(item: any): boolean {
    return item === 'ellipsis';
  }
}
