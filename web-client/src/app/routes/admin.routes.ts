import { Routes } from '@angular/router';
import { ApplicationSettingsPage } from '../pages/application/application-settings/application-settings.page';
import { ApplicationStatusPage } from '../pages/application/application-status/application-status.page';
import { UsersListPage } from '../pages/users/users-list/users-list.page';
import { adminGuard } from '../shared/guards/admin.guard';

export const ADMIN_ROUTES: Routes = [
  { path: 'settings', component: ApplicationSettingsPage, canActivate: [adminGuard] },
  { path: 'system', component: ApplicationStatusPage, canActivate: [adminGuard] },
  { path: 'users', component: UsersListPage },
];
