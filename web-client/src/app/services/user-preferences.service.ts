import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { environment } from '../../environments/environment';
import { ListViewMode } from '../models/enums/list-view-mode.enum';
import {
  UserDateFormat,
  UserThemeMode,
  UserTimeFormat,
} from '../models/enums/user-preferences.enum';

export interface UserPreferencesDto {
  preferredDateFormat: UserDateFormat;
  preferredTimeFormat: UserTimeFormat;
  preferredTimezone: string;
  preferredCurrencyCode: string;
  preferredThemeMode: UserThemeMode;
  preferredItemsPerPage: number;
  preferredLanguage: string;
  pagePreferences: Record<string, ListPagePreferences>;
  isInitialSetupComplete: boolean;
}

export interface ListPagePreferences {
  viewMode: ListViewMode;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  selectedFields: string[];
}

export enum PreferenceKeys {
  DarkMode = 'pref_darkMode',
  ThemeMode = 'pref_themeMode',
  DateFormat = 'pref_dateFormat',
  TimeFormat = 'pref_timeFormat',
  Timezone = 'pref_timezone',
  CurrencyCode = 'pref_currencyCode',
  ItemsPerPage = 'pref_itemsPerPage',
  Language = 'pref_language',
  PageBucketList = 'page_bucketList',
  PageTags = 'page_tags',
  PageJourneys = 'page_journeys',
  PageJourneyCategories = 'page_journeyCategories',
  PageUsers = 'page_users',
}

@Injectable({
  providedIn: 'root',
})
export class UserPreferencesService {
  // Constants
  private readonly STORAGE_PREFIX = 'userPreferences_';
  private readonly API_BASE = `${environment.apiBaseUrl}/preferences`;
  private readonly DEFAULT_DEBOUNCE = 2000; // milliseconds

  private http = inject(HttpClient);

  // Cache for page preferences
  private pagePreferencesMap = new Map<string, BehaviorSubject<ListPagePreferences>>();
  private pageDebounceSubjects = new Map<string, Subject<ListPagePreferences>>();

  // Cache for generic (non-page) preferences
  private genericPreferenceSubjects = new Map<string, BehaviorSubject<any>>();
  private genericDebounceSubjects = new Map<string, Subject<any>>();

  // Backend sync
  private isInitialSetupComplete = new BehaviorSubject<boolean>(true);
  private initialPreferencesLoaded = false;

  // ─── Initialization and Sync ───────────────────────────────────────────
  public loadPreferencesFromBackend(): Observable<void> {
    return this.http.get<UserPreferencesDto>(this.API_BASE).pipe(
      tap((preferences) => {
        this.setPreference(PreferenceKeys.DateFormat, preferences.preferredDateFormat, {
          skipSync: true,
        });
        this.setPreference(PreferenceKeys.TimeFormat, preferences.preferredTimeFormat, {
          skipSync: true,
        });
        this.setPreference(PreferenceKeys.Timezone, preferences.preferredTimezone, {
          skipSync: true,
        });
        this.setPreference(PreferenceKeys.CurrencyCode, preferences.preferredCurrencyCode, {
          skipSync: true,
        });
        this.setPreference(PreferenceKeys.ThemeMode, preferences.preferredThemeMode, {
          skipSync: true,
        });
        this.setPreference(PreferenceKeys.ItemsPerPage, preferences.preferredItemsPerPage, {
          skipSync: true,
        });
        this.setPreference(PreferenceKeys.Language, preferences.preferredLanguage, {
          skipSync: true,
        });

        if (preferences.pagePreferences) {
          Object.entries(preferences.pagePreferences).forEach(([key, value]) => {
            if (this.pagePreferencesMap.has(key)) {
              const subject = this.pagePreferencesMap.get(key)!;
              subject.next(value as ListPagePreferences);
              this._saveToStorage(key, value);
            } else {
              this._saveToStorage(key, value);
            }
          });
        }

        this.isInitialSetupComplete.next(preferences.isInitialSetupComplete);
        this.initialPreferencesLoaded = true;
      }),
      map(() => void 0),
      catchError((err) => {
        console.error('Failed to load user preferences from server', err);
        return of(void 0);
      }),
    );
  }

  public isSetupComplete(): Observable<boolean> {
    return this.isInitialSetupComplete.asObservable();
  }

  public completeInitialSetup(): Observable<any> {
    return this.http
      .post(`${this.API_BASE}/complete-setup`, {})
      .pipe(tap(() => this.isInitialSetupComplete.next(true)));
  }

  // ─── Page Preferences Methods ───────────────────────────────────────────
  getPagePreferences(
    page: string,
    defaultPreferences: ListPagePreferences,
  ): BehaviorSubject<ListPagePreferences> {
    if (!this.pagePreferencesMap.has(page)) {
      const stored = this._loadFromStorage<ListPagePreferences>(page);
      const prefs = stored ?? defaultPreferences;
      this.pagePreferencesMap.set(page, new BehaviorSubject<ListPagePreferences>(prefs));
    }
    return this.pagePreferencesMap.get(page)!;
  }

  setPagePreferences(
    page: string,
    partial: Partial<ListPagePreferences>,
    options?: { debounceTime?: number; sendUpdate?: boolean; skipSync?: boolean },
  ): void {
    const subject = this.pagePreferencesMap.get(page);
    if (!subject) return;

    const updated = { ...subject.value, ...partial };
    subject.next(updated);
    this._saveToStorage(page, updated);

    if (options?.skipSync) {
      return;
    }

    if (options?.sendUpdate) {
      this.http.put(`${this.API_BASE}/${page}`, updated).subscribe({
        next: () => console.log(`Updated page preferences for ${page}`),
        error: (err) => console.error(`Error updating page preferences for ${page}`, err),
      });
    } else {
      this._debouncePageUpdate(page, updated, options?.debounceTime ?? this.DEFAULT_DEBOUNCE);
    }
  }

  // ─── Generic Preferences Methods ────────────────────────────────────────
  getPreference<T>(key: PreferenceKeys, defaultValue: T): BehaviorSubject<T> {
    if (!this.genericPreferenceSubjects.has(key)) {
      const stored = this._loadFromStorage<T>(key);
      const value = stored !== null ? stored : defaultValue;
      this.genericPreferenceSubjects.set(key, new BehaviorSubject<T>(value));
    }
    return this.genericPreferenceSubjects.get(key)!;
  }

  setPreference<T>(
    key: PreferenceKeys,
    value: T,
    options?: { debounceTime?: number; sendUpdate?: boolean; skipSync?: boolean },
  ): void {
    this._saveToStorage(key, value);

    let subject = this.genericPreferenceSubjects.get(key);
    if (!subject) {
      subject = new BehaviorSubject<T>(value);
      this.genericPreferenceSubjects.set(key, subject);
    } else {
      subject.next(value);
    }

    if (options?.skipSync) {
      return;
    }

    const dto = this._createBasicPreferencesDto(key, value);
    if (Object.keys(dto).length === 0) {
      return;
    }

    if (options?.sendUpdate) {
      this.http.put(`${this.API_BASE}/basic`, dto).subscribe({
        next: () => console.log(`Preference ${key} updated on server.`),
        error: (err) => console.error(`Failed updating preference ${key}`, err),
      });
    } else {
      this._debounceGenericUpdate(key, value, options?.debounceTime ?? this.DEFAULT_DEBOUNCE);
    }
  }

  // ─── Batch Update Method ────────────────────────────────────────────────
  updateMultiplePreferences(preferences: Partial<Record<PreferenceKeys, any>>): void {
    Object.entries(preferences).forEach(([key, value]) => {
      const prefKey = key as PreferenceKeys;
      this._saveToStorage(prefKey, value);
      const subject = this.genericPreferenceSubjects.get(prefKey);
      if (subject) {
        subject.next(value);
      } else {
        this.genericPreferenceSubjects.set(prefKey, new BehaviorSubject<any>(value));
      }
    });

    const basicPrefDto = this._createBatchBasicPreferencesDto(preferences);
    if (Object.keys(basicPrefDto).length > 0) {
      this.http.put(`${this.API_BASE}/basic`, basicPrefDto).subscribe({
        next: () => console.log(`Batch preferences updated on server.`),
        error: (err) => console.error(`Failed updating batch preferences`, err),
      });
    }
  }

  updateAllPreferences(preferencesDto: Partial<UserPreferencesDto>): Observable<void> {
    const dto = {
      preferredDateFormat: preferencesDto.preferredDateFormat,
      preferredTimeFormat: preferencesDto.preferredTimeFormat,
      preferredTimezone: preferencesDto.preferredTimezone,
      preferredCurrencyCode: preferencesDto.preferredCurrencyCode,
      preferredThemeMode: preferencesDto.preferredThemeMode,
      preferredItemsPerPage: preferencesDto.preferredItemsPerPage,
      preferredLanguage: preferencesDto.preferredLanguage,
    };

    return this.http.put<void>(`${this.API_BASE}/basic`, dto).pipe(
      tap(() => {
        if (preferencesDto.preferredDateFormat !== undefined) {
          this.setPreference(PreferenceKeys.DateFormat, preferencesDto.preferredDateFormat, {
            skipSync: true,
          });
        }
        if (preferencesDto.preferredTimeFormat !== undefined) {
          this.setPreference(PreferenceKeys.TimeFormat, preferencesDto.preferredTimeFormat, {
            skipSync: true,
          });
        }
        if (preferencesDto.preferredTimezone) {
          this.setPreference(PreferenceKeys.Timezone, preferencesDto.preferredTimezone, {
            skipSync: true,
          });
        }
        if (preferencesDto.preferredCurrencyCode) {
          this.setPreference(PreferenceKeys.CurrencyCode, preferencesDto.preferredCurrencyCode, {
            skipSync: true,
          });
        }
        if (preferencesDto.preferredThemeMode !== undefined) {
          this.setPreference(PreferenceKeys.ThemeMode, preferencesDto.preferredThemeMode, {
            skipSync: true,
          });
        }
        if (preferencesDto.preferredItemsPerPage !== undefined) {
          this.setPreference(PreferenceKeys.ItemsPerPage, preferencesDto.preferredItemsPerPage, {
            skipSync: true,
          });
        }
        if (preferencesDto.preferredLanguage) {
          this.setPreference(PreferenceKeys.Language, preferencesDto.preferredLanguage, {
            skipSync: true,
          });
        }
      }),
    );
  }

  cleanStoragedPreferences(): void {
    const keysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(this.STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => sessionStorage.removeItem(key));

    this.pagePreferencesMap.clear();
    this.pageDebounceSubjects.clear();
    this.genericPreferenceSubjects.clear();
    this.genericDebounceSubjects.clear();
  }

  // ─── Private Helper Methods ─────────────────────────────────────────────
  private _getStorageKey(identifier: string): string {
    return `${this.STORAGE_PREFIX}${identifier}`;
  }

  private _loadFromStorage<T>(identifier: string): T | null {
    const stored = sessionStorage.getItem(this._getStorageKey(identifier));
    return stored ? JSON.parse(stored) : null;
  }

  private _saveToStorage<T>(identifier: string, value: T): void {
    sessionStorage.setItem(this._getStorageKey(identifier), JSON.stringify(value));
  }

  private _debouncePageUpdate(
    page: string,
    prefs: ListPagePreferences,
    debounceTimeValue: number,
  ): void {
    if (!this.pageDebounceSubjects.has(page)) {
      const subject = new Subject<ListPagePreferences>();
      subject
        .pipe(
          debounceTime(debounceTimeValue),
          switchMap((p) => this.http.put(`${this.API_BASE}/${page}`, p)),
        )
        .subscribe({
          next: () =>
            console.log(`Debounced update: page preferences for ${page} saved on server.`),
          error: (err) => console.error(`Debounce update error for page ${page}`, err),
        });
      this.pageDebounceSubjects.set(page, subject);
    }
    this.pageDebounceSubjects.get(page)!.next(prefs);
  }

  private _debounceGenericUpdate<T>(
    key: PreferenceKeys,
    value: T,
    debounceTimeValue: number,
  ): void {
    if (!this.genericDebounceSubjects.has(key)) {
      const subject = new Subject<T>();
      subject
        .pipe(
          debounceTime(debounceTimeValue),
          switchMap((val) => {
            const dto = this._createBasicPreferencesDto(key, val);
            return Object.keys(dto).length > 0
              ? this.http.put(`${this.API_BASE}/basic`, dto)
              : new Observable((observer) => observer.complete());
          }),
        )
        .subscribe({
          next: () => console.log(`Debounced update: preference ${key} saved on server.`),
          error: (err) => console.error(`Debounce update error for preference ${key}`, err),
        });
      this.genericDebounceSubjects.set(key, subject);
    }
    this.genericDebounceSubjects.get(key)!.next(value);
  }

  private _createBasicPreferencesDto<T>(key: PreferenceKeys, value: T): any {
    const dto: any = {};

    switch (key) {
      case PreferenceKeys.DateFormat:
        dto.preferredDateFormat = value;
        break;
      case PreferenceKeys.TimeFormat:
        dto.preferredTimeFormat = value;
        break;
      case PreferenceKeys.Timezone:
        dto.preferredTimezone = value;
        break;
      case PreferenceKeys.CurrencyCode:
        dto.preferredCurrencyCode = value;
        break;
      case PreferenceKeys.ThemeMode:
        dto.preferredThemeMode = value;
        break;
      case PreferenceKeys.ItemsPerPage:
        dto.preferredItemsPerPage = value;
        break;
      case PreferenceKeys.Language:
        dto.preferredLanguage = value;
        break;
    }

    return dto;
  }

  private _createBatchBasicPreferencesDto(preferences: Partial<Record<PreferenceKeys, any>>): any {
    const dto: any = {};

    Object.entries(preferences).forEach(([key, value]) => {
      const prefKey = key as PreferenceKeys;

      switch (prefKey) {
        case PreferenceKeys.DateFormat:
          dto.preferredDateFormat = value;
          break;
        case PreferenceKeys.TimeFormat:
          dto.preferredTimeFormat = value;
          break;
        case PreferenceKeys.Timezone:
          dto.preferredTimezone = value;
          break;
        case PreferenceKeys.CurrencyCode:
          dto.preferredCurrencyCode = value;
          break;
        case PreferenceKeys.ThemeMode:
          dto.preferredThemeMode = value;
          break;
        case PreferenceKeys.ItemsPerPage:
          dto.preferredItemsPerPage = value;
          break;
        case PreferenceKeys.Language:
          dto.preferredLanguage = value;
          break;
      }
    });

    return dto;
  }
}
