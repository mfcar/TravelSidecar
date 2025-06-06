import { ChangeDetectionStrategy, Component, HostListener, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ApplicationHeaderComponent } from '../../headers/application-header/application-header.component';
import { ApplicationSidebarComponent } from '../../ui/application-sidebar/application-sidebar.component';

@Component({
  selector: 'ts-application',
  imports: [
    ApplicationHeaderComponent,
    RouterOutlet,
    ApplicationSidebarComponent,
    FontAwesomeModule,
  ],
  template: `
    <div
      class="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
      role="application"
    >
      <ts-application-sidebar
        [isVisible]="mobileSidebarVisible()"
        (actionCloseMobileSidebar)="closeMobileSidebar()"
        [attr.aria-expanded]="mobileSidebarVisible()"
      />
      <div class="lg:pl-50">
        <ts-application-header
          (openMobileSidebarAction)="openMobileSidebar()"
          [attr.aria-label]="'header'"
        />

        <main class="pt-24 pb-10" role="main" aria-label="Main content">
          <div class="px-4 sm:px-6 lg:px-8">
            <router-outlet />
          </div>
        </main>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationContainer {
  mobileSidebarVisible = signal<boolean>(false);

  closeMobileSidebar() {
    this.mobileSidebarVisible.set(false);
  }

  openMobileSidebar() {
    this.mobileSidebarVisible.set(true);
  }

  @HostListener('keydown.escape')
  handleEscapeKey() {
    if (this.mobileSidebarVisible()) {
      this.closeMobileSidebar();
    }
  }
}
