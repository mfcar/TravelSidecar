import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { TimezoneListResponse } from '../models/timezone.model';

@Injectable({
  providedIn: 'root',
})
export class TimezoneService {
  private apiUrl = `${environment.apiBaseUrl}/timezones`;
  private http = inject(HttpClient);
  private timezonesCache$?: Observable<TimezoneListResponse>;

  getAllTimezones(): Observable<TimezoneListResponse> {
    if (!this.timezonesCache$) {
      this.timezonesCache$ = this.http.get<TimezoneListResponse>(this.apiUrl).pipe(shareReplay(1));
    }

    return this.timezonesCache$;
  }

  getUserTimezone(): string {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (error) {
      console.error('Error detecting user timezone:', error);
      return 'UTC';
    }
  }
}
