import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { JwtService } from './jwt.service';

export interface OidcProvider {
  id: string;
  name: string;
  displayName: string;
}

@Injectable({
  providedIn: 'root',
})
export class OidcAuthService {
  private httpClient = inject(HttpClient);
  private jwtService = inject(JwtService);
  private readonly apiUrl = environment.apiBaseUrl;

  /**
   * Get all available OIDC providers
   */
  public getAvailableProviders(): Observable<OidcProvider[]> {
    return this.httpClient.get<OidcProvider[]>(`${this.apiUrl}/connect/oidc/providers`);
  }

  /**
   * Initiate login with an OIDC provider
   */
  public loginWithProvider(provider: string): void {
    const url = `${this.apiUrl}/connect/oidc/challenge/${provider}`;

    window.location.href = url;
  }

  public completeExternalLogin(token: string): Observable<any> {
    return this.httpClient.post<any>(`${this.apiUrl}/connect/oidc/complete-login`, { token }).pipe(
      tap((response) => {
        if (response.access_token) {
          this.jwtService.saveTokens(
            response.access_token,
            response.refresh_token,
            response.id_token,
          );
        }
      }),
    );
  }
}
