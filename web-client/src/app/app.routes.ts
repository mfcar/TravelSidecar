import { Routes } from '@angular/router';
import { ApplicationContainer } from './components/containers/application/application.container';
import { ChangePasswordPage } from './pages/account/change-password/change-password.page';
import { InitialSetupPage } from './pages/account/initial-setup/initial-setup.page';
import { LoginPage } from './pages/login/login.page';
import { NotFoundPage } from './pages/not-found/not-found.page';
import { RegisterPage } from './pages/register/register.page';
import { authGuard } from './shared/guards/auth.guard';
import { initialSetupGuard } from './shared/guards/initial-setup.guard';
import { passwordChangeGuard } from './shared/guards/password-change.guard';

export const routes: Routes = [
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
  {
    path: 'account/change-password',
    component: ChangePasswordPage,
    canActivate: [authGuard],
  },
  {
    path: 'account/setup',
    component: InitialSetupPage,
    canActivate: [authGuard, passwordChangeGuard],
  },
  {
    path: '',
    component: ApplicationContainer,
    canActivate: [authGuard, passwordChangeGuard, initialSetupGuard],
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./routes/user-features.routes').then((m) => m.USER_FEATURES_ROUTES),
      },

      {
        path: '',
        loadChildren: () => import('./routes/journey.routes').then((m) => m.JOURNEY_ROUTES),
      },

      {
        path: '',
        loadChildren: () => import('./routes/admin.routes').then((m) => m.ADMIN_ROUTES),
      },
    ],
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', component: NotFoundPage },
];
