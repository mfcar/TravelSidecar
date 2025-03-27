import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  input,
  OnDestroy,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Subject } from 'rxjs';
import { SortChangeEvent, SortField } from '../../../models/page-options.model';
import { STANDARD_DROPDOWN_POSITIONS } from '../../../shared/constants/overlay-positions';

@Component({
  selector: 'ts-sort-options',
  imports: [FontAwesomeModule, NgClass, OverlayModule, PortalModule],
  templateUrl: './sort-options.component.html',
  styleUrl: './sort-options.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortOptionsComponent implements OnDestroy {
  // Inputs
  sortFields = input<SortField[]>([]);
  selectedSortBy = input<string>('');
  selectedSortOrder = input<'asc' | 'desc'>('asc');

  // Output
  sortChange = output<SortChangeEvent>();

  // UI state
  protected isOpen = signal(false);
  protected activeItemIndex = signal(-1);

  // References
  protected trigger = viewChild.required<ElementRef>('trigger');

  // Unique ID for accessibility
  protected uniqueId = Math.random().toString(36).substring(2, 15);
  protected menuId = `sort-options-menu-${this.uniqueId}`;
  protected buttonId = `sort-options-button-${this.uniqueId}`;

  // Cleanup
  private destroy$ = new Subject<void>();

  // Position strategy
  protected positions: ConnectedPosition[] = STANDARD_DROPDOWN_POSITIONS;

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!this.trigger().nativeElement.contains(target) && this.isOpen()) {
      this.close();
    }
  }

  toggle(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
    this.activeItemIndex.set(-1);
    this.trigger().nativeElement.focus();
  }

  onFieldClick(field: SortField, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    const newSortBy = field.field;
    const newSortOrder =
      this.selectedSortBy() === field.field
        ? this.selectedSortOrder() === 'asc'
          ? 'desc'
          : 'asc'
        : 'asc';

    this.sortChange.emit({
      sortBy: newSortBy,
      sortOrder: newSortOrder,
    });

    this.close();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (!this.isOpen()) {
      if (
        event.key === 'Enter' ||
        event.key === ' ' ||
        event.key === 'ArrowDown' ||
        event.key === 'ArrowUp'
      ) {
        event.preventDefault();
        this.open();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.navigateOptions(this.activeItemIndex() + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.navigateOptions(this.activeItemIndex() - 1);
        break;
      case 'Home':
        event.preventDefault();
        this.navigateOptions(0);
        break;
      case 'End':
        event.preventDefault();
        this.navigateOptions(this.sortFields().length - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this.activeItemIndex() >= 0) {
          this.onFieldClick(this.sortFields()[this.activeItemIndex()], event);
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
    }
  }

  onOptionKeydown(event: KeyboardEvent, field: SortField, index: number): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.onFieldClick(field, event);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.navigateOptions(index + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.navigateOptions(index - 1);
        break;
      case 'Home':
        event.preventDefault();
        this.navigateOptions(0);
        break;
      case 'End':
        event.preventDefault();
        this.navigateOptions(this.sortFields().length - 1);
        break;
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
    }
  }

  onOptionFocus(index: number): void {
    this.activeItemIndex.set(index);
  }

  private navigateOptions(index: number): void {
    const items = this.sortFields();
    if (items.length === 0) return;

    if (index < 0) {
      index = items.length - 1;
    } else if (index >= items.length) {
      index = 0;
    }

    this.activeItemIndex.set(index);

    setTimeout(() => {
      const options = document.querySelectorAll(`#${this.menuId} [role="menuitemradio"]`);
      if (options[index]) {
        (options[index] as HTMLElement).focus();
      }
    }, 10);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
