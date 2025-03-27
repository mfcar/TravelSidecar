import { Routes } from '@angular/router';
import { AccountSettingsPage } from '../pages/account/account-settings/account-settings.page';
import { ApplicationVersionsPage } from '../pages/application/application-versions/application-versions.page';
import { BucketListItemsPage } from '../pages/bucketList/bucket-list-items/bucket-list-items.page';
import { DashboardPage } from '../pages/dashboard/dashboard.page';
import { JourneysCategoriesListPage } from '../pages/journeysCategories/journey-categories-list/journeys-categories-list-page.component';
import { TagsListPage } from '../pages/tags/tags-list/tags-list.page';

export const USER_FEATURES_ROUTES: Routes = [
  { path: 'account-settings', component: AccountSettingsPage },
  { path: 'bucket-list', component: BucketListItemsPage },
  { path: 'home', component: DashboardPage },
  { path: 'tags', component: TagsListPage },
  { path: 'journey-categories', component: JourneysCategoriesListPage },
  { path: 'versions', component: ApplicationVersionsPage },
];
