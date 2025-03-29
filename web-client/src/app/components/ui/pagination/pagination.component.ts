import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ButtonComponent } from '../../buttons/button/button.component';
import { LoadingIndicatorComponent } from '../loading-indicator/loading-indicator.component';

@Component({
  selector: 'ts-pagination',
  imports: [CommonModule, ButtonComponent, LoadingIndicatorComponent, FontAwesomeModule],
  templateUrl: './pagination.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  totalItems = input.required<number>();
  currentPage = input.required<number>();
  itemsPerPage = input.required<number>();
  isLoading = input<boolean>(false);
  isFiltered = input<boolean>(false);

  pageChange = output<number>();
  resetFilter = output<void>();

  prevNextButtonClasses =
    'relative inline-flex items-center px-2 py-2 text-gray-400 dark:text-gray-400 ring-1 ring-gray-300 dark:ring-gray-600 ring-inset hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50';

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

  getPageButtonClasses(page: number | 'ellipsis'): Record<string, boolean> {
    if (page === 'ellipsis') {
      return {};
    }

    const isCurrentPage = page === this.currentPage();

    const baseClasses =
      'relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0';

    if (isCurrentPage) {
      return {
        [baseClasses]: true,
        'z-10': true,
        'bg-sky-600': true,
        'text-white': true,
        'focus-visible:outline-2': true,
        'focus-visible:outline-offset-2': true,
        'focus-visible:outline-sky-600': true,
      };
    } else {
      return {
        [baseClasses]: true,
        'text-gray-900': true,
        'dark:text-gray-100': true,
        'ring-1': true,
        'ring-gray-300': true,
        'dark:ring-gray-600': true,
        'ring-inset': true,
        'hover:bg-gray-50': true,
        'dark:hover:bg-gray-700': true,
      };
    }
  }

  getPageAriaLabel(page: number | 'ellipsis'): string {
    if (page === 'ellipsis') {
      return $localize`:@@pagination.morePages:More pages`;
    }

    if (page === this.currentPage()) {
      return $localize`:@@pagination.currentPage:Current page, page ${page}`;
    }

    return $localize`:@@pagination.goToPage:Go to page ${page}`;
  }

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

  isEllipsis(item: unknown): item is 'ellipsis' {
    return item === 'ellipsis';
  }
}
