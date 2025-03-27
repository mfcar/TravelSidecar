import { Dialog } from '@angular/cdk/dialog';
import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Subject } from 'rxjs';
import { AccountService } from '../../../services/account.service';
import { ThemeService } from '../../../services/theme.service';
import { PreferenceKeys, UserPreferencesService } from '../../../services/user-preferences.service';
import { STANDARD_DROPDOWN_POSITIONS } from '../../../shared/constants/overlay-positions';
import { AvatarComponent } from '../../avatars/avatar/avatar.component';
import { GlobalSearchComponent } from '../global-search/global-search.component';

@Component({
  selector: 'ts-application-header',
  standalone: true,
  imports: [FontAwesomeModule, OverlayModule, PortalModule, NgClass, RouterModule, AvatarComponent],
  templateUrl: './application-header.component.html',
  styleUrl: './application-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationHeaderComponent implements OnDestroy {
  mobileMenuVisible = signal<boolean>(false);
  openMobileSidebarAction = output<void>();

  // User menu properties
  protected userMenuOpen = signal(false);
  protected activeMenuItemIndex = signal(-1);
  protected userMenuTrigger = viewChild.required<ElementRef>('userMenuTrigger');
  protected positions: ConnectedPosition[] = STANDARD_DROPDOWN_POSITIONS;

  // Unique ID for accessibility
  protected uniqueId = Math.random().toString(36).substring(2, 15);
  protected userMenuId = `user-menu-${this.uniqueId}`;
  protected userMenuButtonId = `user-menu-button-${this.uniqueId}`;

  // Cleanup
  private destroy$ = new Subject<void>();

  // Services
  private dialog = inject(Dialog);
  private userPreferencesService = inject(UserPreferencesService);
  private accountService = inject(AccountService);
  private destroyRef = inject(DestroyRef);
  private themeService = inject(ThemeService);

  // User info
  protected userName = computed(() => this.accountService.getUserInfo()?.name || 'User');

  @HostListener('window:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    const isMac = navigator.platform.toUpperCase().includes('MAC');
    const requiredModifier = isMac ? event.metaKey : event.ctrlKey;

    if (requiredModifier && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.showGlobalSearchDialog();
    }
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent): void {
    if (this.userMenuTrigger && this.userMenuOpen()) {
      const target = event.target as HTMLElement;
      if (!this.userMenuTrigger().nativeElement.contains(target)) {
        this.closeUserMenu();
      }
    }
  }

  // User menu methods
  toggleUserMenu(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.userMenuOpen()) {
      this.closeUserMenu();
    } else {
      this.openUserMenu();
    }
  }

  openUserMenu(): void {
    this.userMenuOpen.set(true);
  }

  closeUserMenu(): void {
    this.userMenuOpen.set(false);
    this.activeMenuItemIndex.set(-1);
    this.userMenuTrigger().nativeElement.focus();
  }

  onMenuItemFocus(index: number): void {
    this.activeMenuItemIndex.set(index);
  }

  onMenuKeyDown(event: KeyboardEvent): void {
    if (!this.userMenuOpen()) {
      if (
        event.key === 'Enter' ||
        event.key === ' ' ||
        event.key === 'ArrowDown' ||
        event.key === 'ArrowUp'
      ) {
        event.preventDefault();
        this.openUserMenu();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.navigateMenu(this.activeMenuItemIndex() + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.navigateMenu(this.activeMenuItemIndex() - 1);
        break;
      case 'Home':
        event.preventDefault();
        this.navigateMenu(0);
        break;
      case 'End':
        event.preventDefault();
        this.navigateMenu(this.getMenuItemCount() - 1);
        break;
      case 'Escape':
        event.preventDefault();
        this.closeUserMenu();
        break;
    }
  }

  onMenuItemKeydown(event: KeyboardEvent, index: number): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.navigateMenu(index + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.navigateMenu(index - 1);
        break;
      case 'Home':
        event.preventDefault();
        this.navigateMenu(0);
        break;
      case 'End':
        event.preventDefault();
        this.navigateMenu(this.getMenuItemCount() - 1);
        break;
      case 'Escape':
        event.preventDefault();
        this.closeUserMenu();
        break;
    }
  }

  private navigateMenu(index: number): void {
    const totalItems = this.getMenuItemCount();

    if (index < 0) {
      index = totalItems - 1;
    } else if (index >= totalItems) {
      index = 0;
    }

    this.activeMenuItemIndex.set(index);

    setTimeout(() => {
      const options = document.querySelectorAll(`#${this.userMenuId} [role="menuitem"]`);
      if (options[index]) {
        (options[index] as HTMLElement).focus();
      }
    }, 10);
  }

  private getMenuItemCount(): number {
    if (this.userMenuOpen()) {
      return document.querySelectorAll(`#${this.userMenuId} [role="menuitem"]`).length;
    }
    return 2;
  }

  logout(): void {
    this.accountService.logout();
    this.closeUserMenu();
    window.location.href = '/login';
  }

  isDarkMode = computed(() => this.themeService.isDarkMode());

  showGlobalSearchDialog(): void {
    const dialogRef = this.dialog.open(GlobalSearchComponent, {
      width: '50vw',
      maxWidth: '800px',
      minWidth: '300px',
      panelClass: 'global-search-dialog',
      hasBackdrop: true,
      backdropClass: 'global-search-backdrop',
    });

    dialogRef.closed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  openMobileSidebar(): void {
    this.openMobileSidebarAction.emit();
  }

  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
  }

  // ─── Expose Enums to the Template ──────────────────────────────────────────────
  protected readonly PreferenceKeys = PreferenceKeys;

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
