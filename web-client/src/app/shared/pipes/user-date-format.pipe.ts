import { DatePipe } from '@angular/common';
import { inject, Pipe, PipeTransform } from '@angular/core';
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
  ): string | null {
    if (!value) return null;

    const datePref = this.prefsService.getPreference(PreferenceKeys.DateFormat, 'mediumDate').value;
    const timePref = this.prefsService.getPreference(PreferenceKeys.TimeFormat, 'mediumTime').value;
    let format: string;

    switch (formatType) {
      case 'date':
        format = datePref;
        break;
      case 'time':
        format = timePref;
        break;
      case 'datetime':
      default:
        format = `${datePref} ${timePref}`;
    }

    return this.datePipe.transform(value, format);
  }
}
