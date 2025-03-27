import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import {
  BucketListItem,
  BucketListItemFilterRequest,
  CreateUpdateBucketListItemRequest,
} from '../models/bucket-list.model';
import { CollectionMatchMode } from '../models/enums/filter-modes.enum';
import { PaginatedResult } from '../models/pagination.model';

@Injectable({
  providedIn: 'root',
})
export class BucketListService {
  private httpClient = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/bucket-list-items`;

  getBucketListItems(
    filters?: BucketListItemFilterRequest,
  ): Observable<PaginatedResult<BucketListItem>> {
    const defaultFilters: BucketListItemFilterRequest = {
      page: 1,
      pageSize: 25,
      tagMatchMode: CollectionMatchMode.Any,
    };

    const requestFilters = { ...defaultFilters, ...filters };

    return this.httpClient.post<PaginatedResult<BucketListItem>>(
      `${this.apiUrl}/filter`,
      requestFilters,
    );
  }

  createBucketListItem(request: CreateUpdateBucketListItemRequest): Observable<BucketListItem> {
    return this.httpClient.post<BucketListItem>(this.apiUrl, request);
  }

  updateBucketListItem(
    id: string,
    request: CreateUpdateBucketListItemRequest,
  ): Observable<BucketListItem> {
    return this.httpClient.put<BucketListItem>(`${this.apiUrl}/${id}`, request);
  }
}
