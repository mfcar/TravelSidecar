import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { CollectionMatchMode } from '../models/enums/filter-modes.enum';
import {
  CreateUpdateJourneyRequest,
  Journey,
  JourneysFilterRequest,
} from '../models/journeys.model';
import { PaginatedResult } from '../models/pagination.model';

@Injectable({
  providedIn: 'root',
})
export class JourneyService {
  private httpClient = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/journeys`;

  getJourneys(filters?: JourneysFilterRequest): Observable<PaginatedResult<Journey>> {
    const defaultFilters: JourneysFilterRequest = {
      page: 1,
      pageSize: 25,
      tagMatchMode: CollectionMatchMode.Any,
    };

    const requestFilters = { ...defaultFilters, ...filters };

    return this.httpClient.post<PaginatedResult<Journey>>(`${this.apiUrl}/filter`, requestFilters);
  }

  getJourneyById(journeyId: string): Observable<Journey> {
    return this.httpClient.get<Journey>(`${this.apiUrl}/${journeyId}`, { withCredentials: true });
  }

  createJourney(request: CreateUpdateJourneyRequest): Observable<Journey> {
    return this.httpClient.post<Journey>(this.apiUrl, request, { withCredentials: true });
  }

  updateJourney(id: string, request: CreateUpdateJourneyRequest): Observable<Journey> {
    return this.httpClient.put<Journey>(`${this.apiUrl}/${id}`, request, {
      withCredentials: true,
    });
  }
}
