import { Routes } from '@angular/router';
import { JourneyContainer } from '../components/containers/journey/journey-container.component';
import { JourneyExpensesPage } from '../pages/journeys/journey-expenses/journey-expenses-page.component';
import { JourneyFilesPage } from '../pages/journeys/journey-files/journey-files-page.component';
import { JourneyItineraryPage } from '../pages/journeys/journey-itinerary/journey-itinerary-page.component';
import { JourneyOverviewPage } from '../pages/journeys/journey-overview/journey-overview-page.component';
import { JourneysListPage } from '../pages/journeys/journeys-list/journeys-list-page.component';

export const JOURNEY_ROUTES: Routes = [
  { path: 'journeys', component: JourneysListPage },
  {
    path: 'journeys/:id',
    component: JourneyContainer,
    children: [
      { path: 'itinerary', component: JourneyItineraryPage },
      { path: 'files', component: JourneyFilesPage },
      { path: 'expenses', component: JourneyExpensesPage },
      { path: 'overview', component: JourneyOverviewPage },
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
    ],
  },
];
