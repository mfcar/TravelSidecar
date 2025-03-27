import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserThemeMode } from '../models/enums/user-preferences.enum';
import { PreferenceKeys, UserPreferencesService } from './user-preferences.service';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private userPreferencesService = inject(UserPreferencesService);
  private destroyRef = inject(DestroyRef);

  private readonly THEME_STORAGE_KEY = 'app_theme_preference';

  private systemThemeMediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
  public currentTheme = signal<UserThemeMode>(this.getInitialTheme());

  constructor() {
    this.applyTheme();

    this.systemThemeMediaQueryList.addEventListener('change', this.handleSystemThemeChange);

    this.userPreferencesService
      .getPreference<UserThemeMode>(PreferenceKeys.ThemeMode, this.currentTheme())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((theme) => {
        if (theme !== this.currentTheme()) {
          this.currentTheme.set(theme);
          this.saveThemeToStorage(theme);
          this.applyTheme();
        }
      });
  }

  /**
   * Gets the initial theme from localStorage or system preference
   */
  private getInitialTheme(): UserThemeMode {
    const storedTheme = localStorage.getItem(this.THEME_STORAGE_KEY);
    if (storedTheme !== null) {
      const themeValue = Number(storedTheme);
      if (themeValue in UserThemeMode) {
        return themeValue;
      }
    }

    return UserThemeMode.System;
  }

  /**
   * Save theme preference to localStorage for persistence
   */
  private saveThemeToStorage(theme: UserThemeMode): void {
    localStorage.setItem(this.THEME_STORAGE_KEY, theme.toString());
  }

  /**
   * Sets and applies the theme
   * @param theme The theme to apply
   * @param savePreference Whether to save to user preferences service
   */
  setTheme(theme: UserThemeMode, savePreference = true): void {
    this.currentTheme.set(theme);
    this.saveThemeToStorage(theme);
    this.applyTheme();

    if (savePreference) {
      this.userPreferencesService.setPreference<UserThemeMode>(PreferenceKeys.ThemeMode, theme);
    }
  }

  /**
   * Toggles between light and dark mode
   */
  toggleDarkMode(): void {
    const isDark = this.isDarkMode();
    const newTheme = isDark ? UserThemeMode.Light : UserThemeMode.Dark;
    this.setTheme(newTheme);
  }

  /**
   * Determines if the current effective theme is dark mode
   */
  isDarkMode(): boolean {
    if (this.currentTheme() === UserThemeMode.System) {
      return this.systemThemeMediaQueryList.matches;
    }
    return this.currentTheme() === UserThemeMode.Dark;
  }

  /**
   * Applies the current theme to the document
   */
  private applyTheme(): void {
    const htmlEl = document.documentElement;
    const theme = this.currentTheme();

    if (theme === UserThemeMode.System) {
      const prefersDark = this.systemThemeMediaQueryList.matches;
      prefersDark ? htmlEl.classList.add('dark') : htmlEl.classList.remove('dark');
    } else if (theme === UserThemeMode.Dark) {
      htmlEl.classList.add('dark');
    } else {
      htmlEl.classList.remove('dark');
    }
  }

  private handleSystemThemeChange = (): void => {
    if (this.currentTheme() === UserThemeMode.System) {
      this.applyTheme();
    }
  };

  dispose(): void {
    this.systemThemeMediaQueryList.removeEventListener('change', this.handleSystemThemeChange);
  }
}
