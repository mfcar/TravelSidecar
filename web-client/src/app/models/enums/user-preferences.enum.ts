export enum UserDateFormat {
  DD_MM_YYYY = 0,
  DD_MM_YYYY_SLASH = 1,
  DD_MM_YYYY_DOT = 2,
  YYYY_MM_DD = 3,
  YYYY_MM_DD_SLASH = 4,
  YYYY_MM_DD_DOT = 5,
  MM_DD_YYYY = 6,
  MM_DD_YYYY_SLASH = 7,
  MM_DD_YYYY_DOT = 8,
  DD_MMMM_YYYY = 9,
  DD_MMM_YYYY = 10,
  MMM_DO_YYYY = 11,
  MMMM_DO_YYYY = 12,
}

export enum UserTimeFormat {
  HH_MM_24 = 0,
  HH_MM_12 = 1,
}

export enum UserThemeMode {
  System = 0,
  Light = 1,
  Dark = 2,
}

export enum UserFirstDayOfWeek {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
}

export const DateFormatLabels: Record<UserDateFormat, string> = {
  [UserDateFormat.DD_MM_YYYY]: '24-12-2024',
  [UserDateFormat.DD_MM_YYYY_SLASH]: '24/12/2024',
  [UserDateFormat.DD_MM_YYYY_DOT]: '24.12.2024',
  [UserDateFormat.YYYY_MM_DD]: '2024-12-24',
  [UserDateFormat.YYYY_MM_DD_SLASH]: '2024/12/24',
  [UserDateFormat.YYYY_MM_DD_DOT]: '2024.12.24',
  [UserDateFormat.MM_DD_YYYY]: '12-24-2024',
  [UserDateFormat.MM_DD_YYYY_SLASH]: '12/24/2024',
  [UserDateFormat.MM_DD_YYYY_DOT]: '12.24.2024',
  [UserDateFormat.DD_MMMM_YYYY]: '24 December 2024',
  [UserDateFormat.DD_MMM_YYYY]: '24 Dec 2024',
  [UserDateFormat.MMM_DO_YYYY]: 'Dec 24th, 2024',
  [UserDateFormat.MMMM_DO_YYYY]: 'December 24th, 2024',
};

export const TimeFormatLabels: Record<UserTimeFormat, string> = {
  [UserTimeFormat.HH_MM_24]: '14:30',
  [UserTimeFormat.HH_MM_12]: '2:30 PM',
};

export const ThemeModeLabels: Record<UserThemeMode, string> = {
  [UserThemeMode.System]: 'System Default',
  [UserThemeMode.Light]: 'Light',
  [UserThemeMode.Dark]: 'Dark',
};

export const dateFormatOptions = Object.entries(UserDateFormat)
  .filter(([key]) => isNaN(Number(key)))
  .map(([key, value]) => ({
    value,
    label: DateFormatLabels[value as UserDateFormat] || key,
  }));

export const timeFormatOptions = Object.entries(UserTimeFormat)
  .filter(([key]) => isNaN(Number(key)))
  .map(([key, value]) => ({
    value,
    label: TimeFormatLabels[value as UserTimeFormat] || key,
  }));

export const firstDayOfWeekOptions = Object.entries(UserFirstDayOfWeek)
  .filter(([key]) => isNaN(Number(key)))
  .map(([key, value]) => ({
    value,
    label: key.charAt(0).toUpperCase() + key.slice(1),
  }));

export const themeModeOptions = Object.entries(UserThemeMode)
  .filter(([key]) => isNaN(Number(key)))
  .map(([key, value]) => ({
    value,
    label: ThemeModeLabels[value as UserThemeMode] || key,
  }));

export const dateFormatToAngularFormat = (format: UserDateFormat): string => {
  const formatMaps: Record<UserDateFormat, string> = {
    [UserDateFormat.DD_MM_YYYY]: 'dd-MM-yyyy',
    [UserDateFormat.DD_MM_YYYY_SLASH]: 'dd/MM/yyyy',
    [UserDateFormat.DD_MM_YYYY_DOT]: 'dd.MM.yyyy',
    [UserDateFormat.YYYY_MM_DD]: 'yyyy-MM-dd',
    [UserDateFormat.YYYY_MM_DD_SLASH]: 'yyyy/MM/dd',
    [UserDateFormat.YYYY_MM_DD_DOT]: 'yyyy.MM.dd',
    [UserDateFormat.MM_DD_YYYY]: 'MM-dd-yyyy',
    [UserDateFormat.MM_DD_YYYY_SLASH]: 'MM/dd/yyyy',
    [UserDateFormat.MM_DD_YYYY_DOT]: 'MM.dd.yyyy',
    [UserDateFormat.DD_MMMM_YYYY]: 'dd MMMM yyyy',
    [UserDateFormat.DD_MMM_YYYY]: 'dd MMM yyyy',
    [UserDateFormat.MMM_DO_YYYY]: 'MMM d, yyyy',
    [UserDateFormat.MMMM_DO_YYYY]: 'MMMM d, yyyy',
  };

  return formatMaps[format] || 'mediumDate';
};

export const timeFormatToAngularFormat = (format: UserTimeFormat): string => {
  const formatMaps: Record<UserTimeFormat, string> = {
    [UserTimeFormat.HH_MM_24]: 'HH:mm',
    [UserTimeFormat.HH_MM_12]: 'hh:mm a',
  };

  return formatMaps[format] || 'shortTime';
};

export const themeModeToString = (mode: UserThemeMode): string => {
  switch (mode) {
    case UserThemeMode.Light:
      return 'light';
    case UserThemeMode.Dark:
      return 'dark';
    case UserThemeMode.System:
    default:
      return 'system';
  }
};

export const stringToThemeMode = (mode: string): UserThemeMode => {
  switch (mode) {
    case 'light':
      return UserThemeMode.Light;
    case 'dark':
      return UserThemeMode.Dark;
    case 'system':
    default:
      return UserThemeMode.System;
  }
};
