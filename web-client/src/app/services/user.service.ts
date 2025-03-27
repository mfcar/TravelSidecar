import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { PaginatedResult } from '../models/pagination.model';
import { User, UserFilterRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private httpClient = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/users`;

  getUsers(filters?: UserFilterRequest): Observable<PaginatedResult<User>> {
    const defaultFilters: UserFilterRequest = {
      page: 1,
      pageSize: 25,
    };

    const requestFilters = { ...defaultFilters, ...filters };

    return this.httpClient.post<PaginatedResult<User>>(`${this.apiUrl}/filter`, requestFilters);
  }
}
