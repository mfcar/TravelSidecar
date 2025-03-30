import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import {
  CreateUpdateJourneyCategoryRequest,
  JourneyCategory,
  JourneyCategoryFilterRequest,
} from '../models/journey-categories.model';
import { PaginatedResult } from '../models/pagination.model';

@Injectable({
  providedIn: 'root',
})
export class JourneyCategoryService {
  private httpClient = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/journey-categories`;

  getJourneyCategories(
    filters?: JourneyCategoryFilterRequest,
  ): Observable<PaginatedResult<JourneyCategory>> {
    const defaultFilters: JourneyCategoryFilterRequest = {
      page: 1,
      pageSize: 25,
    };

    const requestFilters = { ...defaultFilters, ...filters };

    return this.httpClient.post<PaginatedResult<JourneyCategory>>(
      `${this.apiUrl}/filter`,
      requestFilters,
    );
  }

  createJourneyCategory(request: CreateUpdateJourneyCategoryRequest): Observable<JourneyCategory> {
    return this.httpClient.post<JourneyCategory>(this.apiUrl, request, { withCredentials: true });
  }

  updateJourneyCategory(
    id: string,
    request: CreateUpdateJourneyCategoryRequest,
  ): Observable<HttpResponse<void>> {
    return this.httpClient.put<void>(`${this.apiUrl}/${id}`, request, {
      withCredentials: true,
      observe: 'response',
    });
  }

  getJourneyCategoryById(id: string): Observable<JourneyCategory> {
    return this.httpClient.get<JourneyCategory>(`${this.apiUrl}/${id}`, {
      withCredentials: true,
    });
  }
}
