import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError } from 'rxjs';
import { AccountService } from '../../services/account.service';
import { JwtService } from '../../services/jwt.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const jwtService = inject(JwtService);
  const accountService = inject(AccountService);
  const router = inject(Router);

  const isAuthRequest = req.url.includes('/connect/token');

  if (!isAuthRequest) {
    const token = jwtService.getAccessToken();
    if (token) {
      req = addTokenToRequest(req, token);
    }
  }

  return next(req).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && !isAuthRequest) {
        return handleUnauthorizedError(req, next, jwtService, accountService, router);
      }
      return throwError(() => error);
    }),
  );
};

function addTokenToRequest(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

function handleUnauthorizedError(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  jwtService: JwtService,
  accountService: AccountService,
  router: Router,
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = jwtService.getRefreshToken();
    if (!refreshToken) {
      logout(jwtService, router);
      return throwError(() => new Error('No refresh token available'));
    }

    return accountService.refreshToken().pipe(
      switchMap((response) => {
        isRefreshing = false;

        jwtService.saveTokens(response.access_token, response.refresh_token, response.id_token);

        refreshTokenSubject.next(response.access_token);

        return next(addTokenToRequest(request, response.access_token));
      }),
      catchError(() => {
        isRefreshing = false;
        logout(jwtService, router);
        return throwError(() => new Error('Token refresh failed'));
      }),
    );
  } else {
    return refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => next(addTokenToRequest(request, token!))),
    );
  }
}

function logout(jwtService: JwtService, router: Router): void {
  jwtService.removeTokens();
  router.navigate(['/login']);
}
