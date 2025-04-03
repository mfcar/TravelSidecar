import { Routes } from '@angular/router';
import { JourneyContainer } from '../components/containers/journey/journey-container.component';
import { JourneyActivitiesPage } from '../pages/journeys/journey-activities/journey-activities.page';
import { JourneyExpensesPage } from '../pages/journeys/journey-expenses/journey-expenses.page';
import { JourneyFilesPage } from '../pages/journeys/journey-files/journey-files.page';
import { JourneyGalleryPage } from '../pages/journeys/journey-gallery/journey-gallery.page';
import { JourneyOverviewPage } from '../pages/journeys/journey-overview/journey-overview.page';
import { JourneysListPage } from '../pages/journeys/journeys-list/journeys-list.page';

export const JOURNEY_ROUTES: Routes = [
  { path: 'journeys', component: JourneysListPage },
  {
    path: 'journeys/:id',
    component: JourneyContainer,
    children: [
      { path: 'activities', component: JourneyActivitiesPage },
      { path: 'expenses', component: JourneyExpensesPage },
      { path: 'files', component: JourneyFilesPage },
      { path: 'gallery', component: JourneyGalleryPage },
      { path: 'overview', component: JourneyOverviewPage },
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
    ],
  },
];
