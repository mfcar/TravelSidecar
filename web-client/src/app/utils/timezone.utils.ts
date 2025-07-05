import { UserDateFormat, UserTimeFormat } from '../models/user.model';

export interface TimezoneFormatOptions {
  locale?: string;
  dateFormat?: UserDateFormat;
  timeFormat?: UserTimeFormat;
  showTimezone?: boolean;
  showDate?: boolean;
  showTime?: boolean;
}

export interface FormattedDateTime {
  localTime: string;
  userTime?: string;
  isDifferentTimezone: boolean;
}

export class TimezoneUtils {
  /**
   * Format a datetime with timezone information
   */
  static formatDateTime(
    dateTimeString: string | undefined,
    timezone: string | undefined,
    userTimezone: string,
    options: TimezoneFormatOptions = {},
  ): FormattedDateTime | null {
    if (!dateTimeString || !timezone) {
      return null;
    }

    const {
      locale = 'en-US',
      dateFormat = UserDateFormat.MM_DD_YYYY,
      timeFormat = UserTimeFormat.HH_MM_12,
      showTimezone = true,
      showDate = true,
      showTime = true,
    } = options;

    try {
      // Parse the ISO datetime string
      const date = new Date(dateTimeString);

      // Format in the activity's local timezone
      const localFormatter = new Intl.DateTimeFormat(locale, {
        timeZone: timezone,
        ...(showDate && this.getDateFormatOptions(dateFormat)),
        ...(showTime && this.getTimeFormatOptions(timeFormat)),
        ...(showTimezone && { timeZoneName: 'short' }),
      });

      const localTime = localFormatter.format(date);

      // Check if user timezone is different
      const isDifferentTimezone = timezone !== userTimezone;
      let userTime: string | undefined;

      if (isDifferentTimezone) {
        // Format in user's timezone
        const userFormatter = new Intl.DateTimeFormat(locale, {
          timeZone: userTimezone,
          ...(showDate && this.getDateFormatOptions(dateFormat)),
          ...(showTime && this.getTimeFormatOptions(timeFormat)),
          ...(showTimezone && { timeZoneName: 'short' }),
        });

        userTime = userFormatter.format(date);
      }

      return {
        localTime,
        userTime,
        isDifferentTimezone,
      };
    } catch (error) {
      console.error('Error formatting datetime with timezone:', error);
      return null;
    }
  }

  /**
   * Format only the time portion with timezone
   */
  static formatTime(
    dateTimeString: string | undefined,
    timezone: string | undefined,
    userTimezone: string,
    timeFormat: UserTimeFormat = UserTimeFormat.HH_MM_12,
    locale = 'en-US',
  ): FormattedDateTime | null {
    return this.formatDateTime(dateTimeString, timezone, userTimezone, {
      locale,
      timeFormat,
      showDate: false,
      showTime: true,
      showTimezone: false,
    });
  }

  /**
   * Get date format options for Intl.DateTimeFormat
   */
  private static getDateFormatOptions(dateFormat: UserDateFormat): Intl.DateTimeFormatOptions {
    switch (dateFormat) {
      case UserDateFormat.MM_DD_YYYY:
      case UserDateFormat.DD_MM_YYYY:
        return { year: 'numeric', month: '2-digit', day: '2-digit' };
      case UserDateFormat.YYYY_MM_DD:
        return { year: 'numeric', month: '2-digit', day: '2-digit' };
      case UserDateFormat.MMM_DD_YYYY:
      case UserDateFormat.DD_MMM_YYYY:
        return { year: 'numeric', month: 'short', day: 'numeric' };
      case UserDateFormat.YYYY_MMM_DD:
        return { year: 'numeric', month: 'short', day: 'numeric' };
      case UserDateFormat.MMMM_DD_YYYY:
      case UserDateFormat.DD_MMMM_YYYY:
        return { year: 'numeric', month: 'long', day: 'numeric' };
      case UserDateFormat.YYYY_MMMM_DD:
        return { year: 'numeric', month: 'long', day: 'numeric' };
      default:
        return { year: 'numeric', month: '2-digit', day: '2-digit' };
    }
  }

  /**
   * Get time format options for Intl.DateTimeFormat
   */
  private static getTimeFormatOptions(timeFormat: UserTimeFormat): Intl.DateTimeFormatOptions {
    switch (timeFormat) {
      case UserTimeFormat.HH_MM_12:
        return { hour: 'numeric', minute: '2-digit', hour12: true };
      case UserTimeFormat.HH_MM_24:
        return { hour: '2-digit', minute: '2-digit', hour12: false };
      default:
        return { hour: 'numeric', minute: '2-digit', hour12: true };
    }
  }

  /**
   * Convert LocalDateTime string to ISO 8601 format with timezone
   */
  static localDateTimeToISO(localDateTime: string, timezone: string): string {
    // LocalDateTime format: "2024-07-15T10:30:00"
    // We need to convert this to a proper ISO string with timezone
    try {
      // Create a date in the specified timezone
      const [datePart, timePart] = localDateTime.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, minute, second = 0] = timePart.split(':').map(Number);

      // Use Intl.DateTimeFormat to get the offset for this timezone at this date/time
      const date = new Date(year, month - 1, day, hour, minute, second);

      // Format with timezone to get offset
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZoneName: 'longOffset',
      });

      // Parse the formatted parts to reconstruct with offset
      const parts = formatter.formatToParts(date);
      const offset = parts.find((p) => p.type === 'timeZoneName')?.value || '+00:00';

      // Return ISO string with timezone offset
      return `${localDateTime}${offset.replace('GMT', '')}`;
    } catch (error) {
      console.error('Error converting LocalDateTime to ISO:', error);
      return localDateTime; // Return as-is if conversion fails
    }
  }

  /**
   * Format a date range with different timezones
   */
  static formatDateRange(
    startDateTime: string | undefined,
    startTimezone: string | undefined,
    endDateTime: string | undefined,
    endTimezone: string | undefined,
    userTimezone: string,
    options: TimezoneFormatOptions = {},
  ): { start: FormattedDateTime | null; end: FormattedDateTime | null } {
    return {
      start: this.formatDateTime(startDateTime, startTimezone, userTimezone, options),
      end: this.formatDateTime(endDateTime, endTimezone, userTimezone, options),
    };
  }

  /**
   * Get a human-readable timezone name
   */
  static getTimezoneName(timezone: string): string {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        timeZoneName: 'long',
      });

      const parts = formatter.formatToParts(now);
      const timezoneName = parts.find((p) => p.type === 'timeZoneName')?.value;

      return timezoneName || timezone;
    } catch (error) {
      return timezone;
    }
  }

  /**
   * Check if a timezone is valid
   */
  static isValidTimezone(timezone: string): boolean {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      return true;
    } catch (error) {
      return false;
    }
  }
}
