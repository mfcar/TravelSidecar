import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of, take } from 'rxjs';
import { AccountService } from '../../services/account.service';
import { UserPreferencesService } from '../../services/user-preferences.service';

export const initialSetupGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const accountService = inject(AccountService);
  const preferencesService = inject(UserPreferencesService);

  const isSetupRoute = state.url.includes('/account/setup');

  if (!accountService.isAuthenticated()) {
    return true;
  }

  if (isSetupRoute) {
    return true;
  }

  return preferencesService.isSetupComplete().pipe(
    take(1),
    map((isComplete) => {
      if (!isComplete) {
        router.navigate(['/account/setup']);
        return false;
      }
      return true;
    }),
    catchError(() => {
      router.navigate(['/account/setup']);
      return of(false);
    }),
  );
};
