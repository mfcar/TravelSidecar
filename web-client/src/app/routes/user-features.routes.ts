import { Routes } from '@angular/router';
import { TagContainer } from '../components/containers/tag/tag-container.component';
import { AccountSettingsPage } from '../pages/account/account-settings/account-settings.page';
import { ApplicationVersionsPage } from '../pages/application/application-versions/application-versions.page';
import { BucketListItemsPage } from '../pages/bucketList/bucket-list-items/bucket-list-items.page';
import { DashboardPage } from '../pages/dashboard/dashboard.page';
import { JourneyCategoriesListPage } from '../pages/journeyCategories/journey-categories-list/journey-categories-list.page';
import { JourneyCategoryDetailPage } from '../pages/journeyCategories/journey-category-detail/journey-category-detail.page';
import { TagBucketListPage } from '../pages/tags/tag-bucket-list/tag-bucket-list.page';
import { TagJourneysPage } from '../pages/tags/tag-journeys/tag-journeys.page';
import { TagsListPage } from '../pages/tags/tags-list/tags-list.page';

export const USER_FEATURES_ROUTES: Routes = [
  { path: 'account-settings', component: AccountSettingsPage },
  { path: 'bucket-list', component: BucketListItemsPage },
  { path: 'home', component: DashboardPage },
  { path: 'tags', component: TagsListPage },
  {
    path: 'tags/:id',
    component: TagContainer,
    children: [
      { path: '', redirectTo: 'journeys', pathMatch: 'full' },
      { path: 'journeys', component: TagJourneysPage },
      { path: 'bucket-list', component: TagBucketListPage },
    ],
  },
  { path: 'journey-categories', component: JourneyCategoriesListPage },
  { path: 'journey-categories/:id', component: JourneyCategoryDetailPage },
  { path: 'versions', component: ApplicationVersionsPage },
];
