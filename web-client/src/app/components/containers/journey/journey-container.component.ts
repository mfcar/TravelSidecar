import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { JourneyService } from '../../../services/journey.service';
import { JourneyHeaderComponent } from '../../headers/journey-header/journey-header.component';
import { CreateUpdateJourneyModal } from '../../modals/journeys/create-update-journey/create-update-journey-modal.component';
import { UploadDeleteJourneyCoverModal } from '../../modals/journeys/upload-delete-journey-cover/upload-delete-journey-cover.modal';
import { TabLinkItem, TabLinksComponent } from '../../tabs/tab-links/tab-links.component';
import { StickyListToolsComponent } from '../../tools/sticky-list-tools/sticky-list-tools.component';

@Component({
  selector: 'ts-journey',
  imports: [TabLinksComponent, RouterOutlet, JourneyHeaderComponent, StickyListToolsComponent],
  templateUrl: './journey-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JourneyContainer {
  private route = inject(ActivatedRoute);
  private journeyService = inject(JourneyService);
  private router = inject(Router);
  private dialog = inject(Dialog);

  journeyId = computed(() => this.route.snapshot.paramMap.get('id'));

  journeyResource = rxResource({
    request: () => this.journeyId(),
    loader: ({ request }) => {
      return this.journeyService.getJourneyById(request!);
    },
  });

  journeyTabs = signal<TabLinkItem[]>([
    { label: 'Overview', route: './overview', exact: true },
    { label: 'Activities', route: './activities' },
    { label: 'Files', route: './files' },
    { label: 'Gallery', route: './gallery' },
    { label: 'Expenses', route: './expenses' },
  ]);

  journey = computed(() => this.journeyResource.value()!);
  isLoading = computed(() => this.journeyResource.isLoading());

  onEditJourney(): void {
    const currentJourney = this.journey();
    if (!currentJourney) return;

    const dialogRef = this.dialog.open(CreateUpdateJourneyModal, {
      data: { journey: currentJourney },
    });

    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.journeyResource.reload();
      }
    });
  }

  onAddActivity(): void {
    console.log('Add activity clicked');
  }

  onChangeImage(): void {
    const currentJourney = this.journey();
    if (!currentJourney) return;

    const dialogRef = this.dialog.open(UploadDeleteJourneyCoverModal, {
      data: { journey: currentJourney },
    });

    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.journeyResource.reload();
      }
    });
  }
}
