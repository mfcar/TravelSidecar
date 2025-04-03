import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

export interface TabLinkItem {
  label: string;
  route: string;
  exact?: boolean;
}

@Component({
  selector: 'ts-tab-links',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './tab-links.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabLinksComponent {
  tabs = input.required<TabLinkItem[]>();

  ariaLabel = input<string>('Navigation');
  equalWidth = input<boolean>(true);

  // Services
  private router = inject(Router);

  // Computed values
  currentUrl = computed(() => this.router.url);

  selectedTabIndex = computed(() => {
    const currentUrl = this.currentUrl();
    return this.tabs().findIndex((tab) => {
      if (tab.exact) {
        return tab.route === currentUrl;
      }
      return currentUrl.startsWith(tab.route);
    });
  });

  accentClasses = computed(() => {
    const color = 'sky';
    return `border-${color}-500 text-${color}-600 dark:text-${color}-400`;
  });

  // Handle mobile dropdown change
  onSelectChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const selectedIndex = select.selectedIndex;
    if (selectedIndex >= 0 && selectedIndex < this.tabs().length) {
      this.router.navigateByUrl(this.tabs()[selectedIndex].route);
    }
  }

  // Generate unique ID for accessibility
  protected readonly uniqueId = `tab-links-${Math.random().toString(36).substring(2, 9)}`;
}
