import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'ts-collapsible-section',
  imports: [FontAwesomeModule, NgClass],
  template: `
    <div class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
      <!-- Header -->
      <button
        type="button"
        class="w-full flex items-center justify-between p-3 text-left transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500"
        (click)="toggleExpanded()"
        [attr.aria-expanded]="isExpanded()"
        [attr.aria-controls]="contentId"
      >
        <div class="flex items-center gap-3">
          @if (showIcon()) {
            <fa-icon 
              [icon]="isExpanded() ? ['fas', 'chevron-down'] : ['fas', 'chevron-right']" 
              class="h-3 w-3 text-gray-500 dark:text-gray-400 transition-transform duration-200"
              [ngClass]="{ 'rotate-0': !isExpanded() }"
            />
          }
          <div class="flex-1">
            <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">
              {{ title() }}
            </h3>
            @if (subtitle() && (!isExpanded() || alwaysShowSubtitle())) {
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {{ subtitle() }}
              </p>
            }
          </div>
        </div>
        
        @if (showToggleIcon()) {
          <fa-icon 
            [icon]="isExpanded() ? ['fas', 'minus'] : ['fas', 'plus']" 
            class="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0"
          />
        }
      </button>

      <!-- Content -->
      <div
        [id]="contentId"
        class="overflow-hidden transition-all duration-300 ease-in-out"
        [ngClass]="{
          'max-h-0': !isExpanded(),
          'max-h-[2000px]': isExpanded()
        }"
      >
        <div class="px-3 pb-3">
          <ng-content />
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    /* Smooth height animation */
    .max-h-\\[2000px\\] {
      max-height: 2000px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollapsibleSectionComponent {
  // Inputs
  title = input.required<string>();
  subtitle = input<string>('');
  isExpandedInitial = input<boolean>(true);
  showIcon = input<boolean>(true);
  showToggleIcon = input<boolean>(false);
  alwaysShowSubtitle = input<boolean>(false);
  storageKey = input<string>(''); // Optional key for localStorage persistence

  // Outputs
  expandedChange = output<boolean>();

  // Internal state
  isExpanded = signal<boolean>(true);
  contentId = `collapsible-content-${Math.random().toString(36).substr(2, 9)}`;

  constructor() {
    // Initialize expanded state
    const storageKey = this.storageKey();
    if (storageKey) {
      const savedState = localStorage.getItem(storageKey);
      if (savedState !== null) {
        this.isExpanded.set(savedState === 'true');
      } else {
        this.isExpanded.set(this.isExpandedInitial());
      }
    } else {
      this.isExpanded.set(this.isExpandedInitial());
    }
  }

  toggleExpanded(): void {
    const newState = !this.isExpanded();
    this.isExpanded.set(newState);
    
    // Save to localStorage if key provided
    const storageKey = this.storageKey();
    if (storageKey) {
      localStorage.setItem(storageKey, newState.toString());
    }
    
    this.expandedChange.emit(newState);
  }

  // Public method to programmatically set expanded state
  setExpanded(expanded: boolean): void {
    this.isExpanded.set(expanded);
    
    const storageKey = this.storageKey();
    if (storageKey) {
      localStorage.setItem(storageKey, expanded.toString());
    }
    
    this.expandedChange.emit(expanded);
  }
}