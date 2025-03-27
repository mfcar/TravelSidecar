import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../../services/account.service';

export const passwordChangeGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  const router = inject(Router);

  const requiresChange = accountService.requirePasswordChange();
  const isChangePasswordRoute = state.url.includes('/account/change-password');
  const isLoginRoute = state.url === '/login';

  if (isLoginRoute) {
    accountService.logout();
    return true;
  }

  if (requiresChange && !isChangePasswordRoute) {
    router.navigate(['/account/change-password']);
    return false;
  }

  return true;
};
