import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, of, switchMap, tap } from 'rxjs';
import { environment } from '../../environments/environment.development';
import {
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
} from '../models/account.model';
import { JwtService } from './jwt.service';
import { UserPreferencesService } from './user-preferences.service';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private httpClient = inject(HttpClient);
  private jwtService = inject(JwtService);
  private prefsService = inject(UserPreferencesService);
  private apiUrl = `${environment.apiBaseUrl}`;

  public requirePasswordChange = signal<boolean>(false);

  constructor() {
    this.checkPasswordChangeRequirement();
  }

  private checkPasswordChangeRequirement(): void {
    const userClaims = this.jwtService.getUserInfo();
    if (
      userClaims &&
      (userClaims.require_password_change === 'true' || userClaims.require_password_change === true)
    ) {
      this.requirePasswordChange.set(true);
    }
  }

  public login(request: LoginRequest): Observable<any> {
    const payload = new URLSearchParams();
    payload.set('grant_type', 'password');
    payload.set('username', request.emailUsername);
    payload.set('password', request.password);
    payload.set('scope', 'api openid profile email offline_access');

    return this.httpClient
      .post<any>(`${this.apiUrl}/connect/token`, payload.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      .pipe(
        tap((response) => {
          this.jwtService.saveTokens(
            response.access_token,
            response.refresh_token,
            response.id_token,
          );

          this.checkPasswordChangeRequirement();
        }),
        switchMap(() => this.loadUserPreferences()),
      );
  }

  private loadUserPreferences(): Observable<void> {
    return this.prefsService.loadPreferencesFromBackend().pipe(
      catchError((error) => {
        console.error('Failed to load user preferences:', error);
        return of(void 0);
      }),
    );
  }

  public register(request: RegisterRequest): Observable<RegisterResponse> {
    return this.httpClient.post<RegisterResponse>(`${this.apiUrl}/account/register`, request);
  }

  public logout(): void {
    this.jwtService.removeTokens();
    this.prefsService.cleanStoragedPreferences();
    this.requirePasswordChange.set(false);
  }

  public isAuthenticated(): boolean {
    return this.jwtService.isAuthenticated();
  }

  public getUserInfo(): any {
    const userInfo = this.jwtService.getUserInfo();
    if (!userInfo) return null;

    const name =
      userInfo.name ||
      userInfo.preferred_username ||
      userInfo.username ||
      userInfo['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
      userInfo.email ||
      userInfo['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
      userInfo.sub ||
      'User';

    const email =
      userInfo.email ||
      userInfo['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
      '';

    return {
      name,
      email,
      id: userInfo.sub || '',
      ...userInfo,
    };
  }

  public isAdmin(): boolean {
    const userInfo = this.getUserInfo();
    if (!userInfo) return false;

    const role =
      userInfo['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      userInfo['role'] ||
      userInfo['roles'];

    if (!role) return false;

    if (Array.isArray(role)) {
      return role.includes('Admin');
    }

    return role === 'Admin';
  }

  public changePassword(request: ChangePasswordRequest): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/account/change-password`, request).pipe(
      tap(() => {
        this.requirePasswordChange.set(false);
      }),
    );
  }

  public refreshToken(): Observable<any> {
    const refreshToken = this.jwtService.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const payload = new URLSearchParams();
    payload.set('grant_type', 'refresh_token');
    payload.set('refresh_token', refreshToken);

    return this.httpClient
      .post<any>(`${this.apiUrl}/connect/token`, payload.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      .pipe(
        tap((response) => {
          this.jwtService.saveTokens(
            response.access_token,
            response.refresh_token,
            response.id_token,
          );
        }),
      );
  }
}
