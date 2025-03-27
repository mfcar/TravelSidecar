import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { SystemStatus } from '../models/system-status.model';

@Injectable({
  providedIn: 'root',
})
export class SystemInfoService {
  private httpClient = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/system-info`;

  public getSystemStatus(): Observable<SystemStatus> {
    return this.httpClient.get<SystemStatus>(`${this.apiUrl}/status`);
  }
}
