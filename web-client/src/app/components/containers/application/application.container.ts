import { ChangeDetectionStrategy, Component, HostListener, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ApplicationHeaderComponent } from '../../ui/application-header/application-header.component';
import { ApplicationSidebarComponent } from '../../ui/application-sidebar/application-sidebar.component';

@Component({
  selector: 'ts-application',
  imports: [
    ApplicationHeaderComponent,
    RouterOutlet,
    ApplicationSidebarComponent,
    FontAwesomeModule,
  ],
  templateUrl: './application.container.html',
  styleUrl: './application.container.scss',
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
