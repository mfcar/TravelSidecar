import { DatePipe } from '@angular/common';
import { inject, Pipe, PipeTransform } from '@angular/core';
import {
  dateFormatToAngularFormat,
  timeFormatToAngularFormat,
  UserDateFormat,
  UserTimeFormat,
} from '../../models/enums/user-preferences.enum';
import { PreferenceKeys, UserPreferencesService } from '../../services/user-preferences.service';

@Pipe({
  name: 'userDateFormat',
  pure: true,
})
export class UserDateFormatPipe implements PipeTransform {
  private datePipe = inject(DatePipe);
  private prefsService = inject(UserPreferencesService);

  transform(
    value: Date | string,
    formatType: 'date' | 'time' | 'datetime' = 'datetime',
    useTimezone = true,
  ): string | null {
    if (!value) return null;

    const dateFormatEnum = this.prefsService.getPreference(
      PreferenceKeys.DateFormat,
      UserDateFormat.DD_MM_YYYY,
    ).value as UserDateFormat;
    const timeFormatEnum = this.prefsService.getPreference(
      PreferenceKeys.TimeFormat,
      UserTimeFormat.HH_MM_24,
    ).value as UserTimeFormat;

    const dateFormat = dateFormatToAngularFormat(dateFormatEnum);
    const timeFormat = timeFormatToAngularFormat(timeFormatEnum);

    let format: string;
    switch (formatType) {
      case 'date':
        format = dateFormat;
        break;
      case 'time':
        format = timeFormat;
        break;
      case 'datetime':
      default:
        format = `${dateFormat} ${timeFormat}`;
    }

    let timezone: string | undefined;
    if (useTimezone) {
      timezone = this.prefsService.getPreference(PreferenceKeys.Timezone, 'UTC').value as string;
    }

    return this.datePipe.transform(value, format, timezone);
  }
}
