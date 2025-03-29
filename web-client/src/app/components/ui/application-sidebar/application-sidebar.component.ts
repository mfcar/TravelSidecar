import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, linkedSignal, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { version } from '../../../version';
import { ApplicationLogoComponent } from '../application-logo/application-logo.component';

interface SidebarLink {
  label: string;
  icon: string;
  routerLink: (string | number)[];
}

@Component({
  selector: 'ts-application-sidebar',
  imports: [
    FontAwesomeModule,
    RouterLink,
    RouterLinkActive,
    NgTemplateOutlet,
    ApplicationLogoComponent,
  ],
  templateUrl: './application-sidebar.component.html',
  styleUrl: './application-sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationSidebarComponent {
  isVisible = input<boolean>(false);
  mobileSidebarIsVisible = linkedSignal(this.isVisible);
  actionCloseMobileSidebar = output<void>();

  mainSidebarLinks: SidebarLink[] = [
    { label: 'Home', icon: 'home', routerLink: ['/home'] },
    { label: 'Journeys', icon: 'plane-departure', routerLink: ['/journeys'] },
    { label: 'Tags', icon: 'tags', routerLink: ['/tags'] },
    { label: 'Bucket List', icon: 'clipboard-list', routerLink: ['/bucket-list'] },
  ];

  managementSidebarLinks: SidebarLink[] = [
    { label: 'Journey Categories', icon: 'list', routerLink: ['/journey-categories'] },
    { label: 'Users', icon: 'users', routerLink: ['/users'] },
  ];

  fixedLinks = {
    settings: { label: 'Settings', icon: 'cog', routerLink: ['/settings'] },
    version: { label: `Version: ${version}`, routerLink: ['/versions'] },
    status: { label: 'Application Status', routerLink: ['/system'] },
  };

  closeMobileSidebar() {
    this.actionCloseMobileSidebar.emit();
  }
}
