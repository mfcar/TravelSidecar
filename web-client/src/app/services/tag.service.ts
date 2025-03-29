import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { PaginatedResult } from '../models/pagination.model';
import { CreateUpdateTagRequest, TagFilterRequest, TagResponse } from '../models/tags.model';

@Injectable({
  providedIn: 'root',
})
export class TagService {
  private httpClient = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/tags`;

  getTags(filters?: TagFilterRequest): Observable<PaginatedResult<TagResponse>> {
    const defaultFilters: TagFilterRequest = {
      page: 1,
      pageSize: 25,
    };

    const requestFilters = { ...defaultFilters, ...filters };

    return this.httpClient.post<PaginatedResult<TagResponse>>(
      `${this.apiUrl}/filter`,
      requestFilters,
    );
  }

  getTagById(tagId: string): Observable<TagResponse> {
    return this.httpClient.get<TagResponse>(`${this.apiUrl}/${tagId}`, { withCredentials: true });
  }

  createTag(request: CreateUpdateTagRequest): Observable<TagResponse> {
    return this.httpClient.post<TagResponse>(this.apiUrl, request, { withCredentials: true });
  }

  updateTag(id: string, request: CreateUpdateTagRequest): Observable<void> {
    return this.httpClient.put<void>(`${this.apiUrl}/${id}`, request, {
      withCredentials: true,
    });
  }
}
