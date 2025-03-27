import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { ApplicationSettings } from '../models/application-settings.model';

@Injectable({
  providedIn: 'root',
})
export class ApplicationSettingsService {
  private httpClient = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/application-settings`;

  getApplicationSettings(): Observable<ApplicationSettings> {
    return this.httpClient.get<ApplicationSettings>(this.apiUrl);
  }
}
