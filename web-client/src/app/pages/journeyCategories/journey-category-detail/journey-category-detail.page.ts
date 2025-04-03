import { Dialog } from '@angular/cdk/dialog';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../components/buttons/button/button.component';
import { PageHeaderComponent } from '../../../components/headers/page-header/page-header.component';
import { CreateUpdateJourneyCategoryModal } from '../../../components/modals/journeyCategories/create-update-journey-category/create-update-journey-category-modal.component';
import { StatGroupComponent } from '../../../components/stats/stat-group/stat-group.component';
import { StatComponent } from '../../../components/stats/stat/stat.component';
import { AlertComponent } from '../../../components/ui/alert/alert.component';
import { LoadingIndicatorComponent } from '../../../components/ui/loading-indicator/loading-indicator.component';
import { JourneyCategoryService } from '../../../services/journey-category.service';

@Component({
  selector: 'ts-journey-category-detail',
  imports: [
    PageHeaderComponent,
    DatePipe,
    RouterLink,
    ButtonComponent,
    AlertComponent,
    LoadingIndicatorComponent,
    StatGroupComponent,
    StatComponent,
  ],
  templateUrl: './journey-category-detail.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JourneyCategoryDetailPage {
  private journeyCategoryService = inject(JourneyCategoryService);
  private route = inject(ActivatedRoute);
  private dialog = inject(Dialog);

  private categoryId: Signal<string | null> = computed(() =>
    this.route.snapshot.paramMap.get('id'),
  );

  categoryResource = rxResource({
    request: () => this.categoryId(),
    loader: ({ request: id }) => {
      return this.journeyCategoryService.getJourneyCategoryById(id!);
    },
  });

  category = computed(() => this.categoryResource.value());
  isLoading = computed(() => this.categoryResource.isLoading());
  error = computed(() => {
    const err = this.categoryResource.error();
    return err ? 'Failed to load journey category details. Please try again later.' : null;
  });

  showUpdateModal(): void {
    if (!this.category()) return;

    const dialogRef = this.dialog.open(CreateUpdateJourneyCategoryModal, {
      data: { journeyCategory: this.category() },
    });

    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.categoryResource.reload();
      }
    });
  }
}
