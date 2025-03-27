import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';
import { Currency } from '../models/currency.model';

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  private apiUrl = `${environment.apiBaseUrl}/currencies`;
  private currenciesCache$?: Observable<Currency[]>;

  constructor(private http: HttpClient) {}

  getAllCurrencies(): Observable<Currency[]> {
    if (!this.currenciesCache$) {
      this.currenciesCache$ = this.http.get<Currency[]>(this.apiUrl).pipe(shareReplay(1));
    }

    return this.currenciesCache$;
  }
}
