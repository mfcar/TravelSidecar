import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'ts-activity-divider',
  imports: [FontAwesomeModule, NgClass],
  template: `
    <div 
      class="activity-divider group relative -mx-3 px-3 py-1 transition-all duration-200"
      (mouseenter)="setHovered(true)"
      (mouseleave)="setHovered(false)"
    >
      <!-- Divider line -->
      <div class="relative">
        <div 
          class="absolute inset-0 flex items-center" 
          aria-hidden="true"
        >
          <div 
            class="w-full border-t transition-all duration-200"
            [ngClass]="{
              'border-gray-200 dark:border-gray-700': !isHovered(),
              'border-sky-300 dark:border-sky-700': isHovered()
            }"
          ></div>
        </div>
        
        <!-- Add button -->
        <div class="relative flex justify-center">
          <button
            type="button"
            class="add-activity-btn flex items-center gap-2 bg-white dark:bg-gray-900 px-3 py-1 text-xs font-medium rounded-full shadow-sm ring-1 transition-all duration-200 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 focus:opacity-100 focus:scale-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
            [ngClass]="{
              'text-gray-400 ring-gray-300 hover:text-sky-600 hover:ring-sky-300 dark:text-gray-500 dark:ring-gray-700 dark:hover:text-sky-400 dark:hover:ring-sky-700': !isHovered(),
              'text-sky-600 ring-sky-300 dark:text-sky-400 dark:ring-sky-700': isHovered()
            }"
            (click)="onAddActivity()"
            [attr.aria-label]="label() || 'Add activity here'"
          >
            <fa-icon [icon]="['fas', 'plus']" class="h-3 w-3" />
            <span>{{ label() || 'Add activity' }}</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .activity-divider {
      /* Increase hover area for better UX */
      margin-top: -0.25rem;
      margin-bottom: -0.25rem;
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
    }

    .add-activity-btn {
      /* Smooth transitions for hover effects */
      transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Ensure button is accessible via keyboard navigation */
    .add-activity-btn:focus {
      @apply opacity-100 scale-100;
    }

    /* Prevent layout shift when button appears */
    .activity-divider:not(:hover) .add-activity-btn {
      pointer-events: none;
    }

    .activity-divider:hover .add-activity-btn,
    .add-activity-btn:focus {
      pointer-events: auto;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityDividerComponent {
  // Inputs
  label = input<string>(''); // Optional custom label
  context = input<any>(null); // Optional context data to pass when adding

  // Outputs
  addActivity = output<any>(); // Emits when add button is clicked

  // Internal state
  isHovered = signal(false);

  setHovered(hovered: boolean): void {
    this.isHovered.set(hovered);
  }

  onAddActivity(): void {
    this.addActivity.emit(this.context());
  }
}