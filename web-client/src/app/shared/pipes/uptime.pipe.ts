import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'uptime',
  pure: true,
})
export class UptimePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    const parts = value.split(':');
    let days = '0';
    let hours = parts[0];
    const minutes = parts[1];
    const seconds = parts[2].split('.')[0];

    if (hours.includes('.')) {
      const dayHourParts = hours.split('.');
      days = dayHourParts[0];
      hours = dayHourParts[1];
    }

    return `${days}${$localize`:@@daysInitialLetter:d`} ${hours}${$localize`:@@hoursInitialLetter:h`} ${minutes}${$localize`:@@minutesInitialLetter:m`} ${seconds}${$localize`:@@secondsInitialLetter:s`}`;
  }
}
