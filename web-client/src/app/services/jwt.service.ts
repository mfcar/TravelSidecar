import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root',
})
export class JwtService {
  private jwtHelper = new JwtHelperService();
  private readonly ACCESS_TOKEN_KEY = 'ts_access_token';
  private readonly REFRESH_TOKEN_KEY = 'ts_refresh_token';
  private readonly ID_TOKEN_KEY = 'ts_id_token';

  public saveTokens(accessToken: string, refreshToken: string, idToken?: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    if (idToken) {
      localStorage.setItem(this.ID_TOKEN_KEY, idToken);
    }
  }

  public getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  public getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  public getIdToken(): string | null {
    return localStorage.getItem(this.ID_TOKEN_KEY);
  }

  public removeTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.ID_TOKEN_KEY);
  }

  public isAuthenticated(): boolean {
    const accessToken = this.getAccessToken();
    if (!accessToken) return false;

    const idToken = this.getIdToken();
    if (idToken) {
      try {
        return !this.jwtHelper.isTokenExpired(idToken);
      } catch {
        return true;
      }
    }

    return true;
  }

  public getUserInfo(): any {
    const idToken = this.getIdToken();
    if (idToken) {
      try {
        return this.jwtHelper.decodeToken(idToken);
      } catch {
        /* empty */
      }
    }

    const accessToken = this.getAccessToken();
    if (!accessToken) return null;

    try {
      return this.jwtHelper.decodeToken(accessToken);
    } catch {
      this.removeTokens();
      return null;
    }
  }
}
