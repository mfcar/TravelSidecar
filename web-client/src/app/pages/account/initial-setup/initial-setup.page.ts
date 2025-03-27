import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { combineLatest, finalize, map, Observable, take, tap } from 'rxjs';
import { ButtonComponent } from '../../../components/buttons/button/button.component';
import { GenericSelectorInputComponent } from '../../../components/forms/generic-selector-input/generic-selector-input.component';
import { AlertComponent } from '../../../components/ui/alert/alert.component';
import { ApplicationLogoComponent } from '../../../components/ui/application-logo/application-logo.component';
import { Currency } from '../../../models/currency.model';
import {
  dateFormatOptions,
  themeModeOptions,
  timeFormatOptions,
  UserDateFormat,
  UserThemeMode,
  UserTimeFormat,
} from '../../../models/enums/user-preferences.enum';
import { Timezone } from '../../../models/timezone.model';
import { CurrencyService } from '../../../services/currency.service';
import { ThemeService } from '../../../services/theme.service';
import { TimezoneService } from '../../../services/timezone.service';
import { PreferenceKeys, UserPreferencesService } from '../../../services/user-preferences.service';

interface SelectOption<T = string | number> {
  value: T;
  label: string;
  secondaryText?: string;
}

@Component({
  selector: 'ts-initial-setup',
  imports: [
    ReactiveFormsModule,
    GenericSelectorInputComponent,
    ButtonComponent,
    AlertComponent,
    ApplicationLogoComponent,
    AsyncPipe,
  ],
  templateUrl: './initial-setup.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InitialSetupPage implements OnInit {
  private formBuilder = inject(FormBuilder);
  private preferencesService = inject(UserPreferencesService);
  private timezoneService = inject(TimezoneService);
  private currencyService = inject(CurrencyService);
  private router = inject(Router);
  private themeService = inject(ThemeService);

  public errorMessage = signal<string | null>(null);
  public isLoading = signal<boolean>(false);

  public dateFormatOptions = dateFormatOptions;
  public timeFormatOptions = timeFormatOptions;
  public themeModeOptions = themeModeOptions;
  public itemsPerPageOptions: SelectOption[] = [
    { value: 10, label: '10' },
    { value: 25, label: '25' },
    { value: 50, label: '50' },
    { value: 100, label: '100' },
  ];
  public languageOptions: SelectOption[] = [{ value: 'en', label: 'English' }];

  public timezoneOptions$: Observable<SelectOption[]> = this.timezoneService.getAllTimezones().pipe(
    map((response) => response.items),
    map((timezones) => this.transformTimezonesToOptions(timezones)),
    tap((options) => {
      const userTimezone = this.timezoneService.getUserTimezone();
      if (userTimezone && this.setupForm) {
        const timezoneOption = options.find((opt) => opt.value === userTimezone);
        if (timezoneOption) {
          this.setupForm.get('timezone')?.setValue(userTimezone);
        }
      }
    }),
  );

  public currencyOptions$: Observable<SelectOption[]> = this.currencyService
    .getAllCurrencies()
    .pipe(map((currencies) => this.transformCurrenciesToOptions(currencies)));

  setupForm: FormGroup = this.formBuilder.group({
    dateFormat: [UserDateFormat.DD_MM_YYYY, Validators.required],
    timeFormat: [UserTimeFormat.HH_MM_24, Validators.required],
    timezone: ['UTC', Validators.required],
    currency: ['EUR', Validators.required],
    themeMode: [UserThemeMode.System, Validators.required],
    itemsPerPage: [25, [Validators.required, Validators.min(5), Validators.max(100)]],
    language: ['en', Validators.required],
  });

  ngOnInit(): void {
    this.isLoading.set(true);

    this.preferencesService
      .loadPreferencesFromBackend()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => this.loadCurrentPreferences(),
        error: () => {
          this.loadCurrentPreferences();
          this.errorMessage.set(
            'Could not load your preferences from the server. Default values are shown.',
          );
        },
      });

    this.setupForm.get('themeMode')?.valueChanges.subscribe((theme) => {
      if (theme !== null && theme !== undefined) {
        this.themeService.setTheme(theme, false);
      }
    });
  }

  private loadCurrentPreferences(): void {
    combineLatest({
      dateFormat: this.preferencesService.getPreference<UserDateFormat>(
        PreferenceKeys.DateFormat,
        UserDateFormat.DD_MM_YYYY,
      ),
      timeFormat: this.preferencesService.getPreference<UserTimeFormat>(
        PreferenceKeys.TimeFormat,
        UserTimeFormat.HH_MM_24,
      ),
      timezone: this.preferencesService.getPreference<string>(PreferenceKeys.Timezone, 'UTC'),
      currency: this.preferencesService.getPreference<string>(PreferenceKeys.CurrencyCode, 'EUR'),
      themeMode: this.preferencesService.getPreference<UserThemeMode>(
        PreferenceKeys.ThemeMode,
        UserThemeMode.System,
      ),
      itemsPerPage: this.preferencesService.getPreference<number>(PreferenceKeys.ItemsPerPage, 25),
      language: this.preferencesService.getPreference<string>(PreferenceKeys.Language, 'en'),
    })
      .pipe(take(1))
      .subscribe((prefs) => {
        this.setupForm.patchValue({
          dateFormat: prefs.dateFormat,
          timeFormat: prefs.timeFormat,
          timezone: prefs.timezone,
          currency: prefs.currency,
          themeMode: prefs.themeMode,
          itemsPerPage: prefs.itemsPerPage,
          language: prefs.language,
        });
      });
  }

  onSubmit(): void {
    if (this.setupForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValues = this.setupForm.value;

    const preferencesDto = {
      preferredDateFormat: formValues.dateFormat,
      preferredTimeFormat: formValues.timeFormat,
      preferredTimezone: formValues.timezone,
      preferredCurrencyCode: formValues.currency,
      preferredThemeMode: formValues.themeMode,
      preferredItemsPerPage: formValues.itemsPerPage,
      preferredLanguage: formValues.language,
    };

    this.preferencesService
      .updateAllPreferences(preferencesDto)
      .pipe(
        tap(() => console.log('Preferences updated successfully')),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: () => {
          this.preferencesService.completeInitialSetup().subscribe({
            next: () => this.router.navigate(['/home']),
            error: (err) => {
              console.error('Failed to complete initial setup:', err);
              this.errorMessage.set('Failed to complete setup. Please try again.');
            },
          });
        },
        error: (err) => {
          console.error('Failed to update preferences:', err);
          this.errorMessage.set('Failed to save your preferences. Please try again.');
        },
      });
  }

  private transformTimezonesToOptions(timezones: Timezone[]): SelectOption[] {
    return timezones.map((tz) => ({
      value: tz.id,
      label: tz.id,
      secondaryText: tz.gmtOffset,
    }));
  }

  private transformCurrenciesToOptions(currencies: Currency[]): SelectOption[] {
    return currencies.map((currency) => ({
      value: currency.code,
      label: currency.code,
      secondaryText: currency.englishName,
    }));
  }
}
