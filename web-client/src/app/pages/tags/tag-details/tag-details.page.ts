import { Dialog } from '@angular/cdk/dialog';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TagBadgeComponent } from '../../../components/badges/tag-badge/tag-badge.component';
import { ButtonComponent } from '../../../components/buttons/button/button.component';
import { CreateUpdateTagModal } from '../../../components/modals/tags/create-update-tag/create-update-tag.modal';
import { StatGroupComponent } from '../../../components/stats/stat-group/stat-group.component';
import { StatComponent } from '../../../components/stats/stat/stat.component';
import { AlertComponent } from '../../../components/ui/alert/alert.component';
import { LoadingIndicatorComponent } from '../../../components/ui/loading-indicator/loading-indicator.component';
import { PageHeaderComponent } from '../../../components/ui/page-header/page-header.component';
import { TagService } from '../../../services/tag.service';

@Component({
  selector: 'ts-tag-details',
  imports: [
    PageHeaderComponent,
    TagBadgeComponent,
    DatePipe,
    RouterLink,
    ButtonComponent,
    AlertComponent,
    LoadingIndicatorComponent,
    StatGroupComponent,
    StatComponent,
  ],
  templateUrl: './tag-details.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagDetailsPage {
  private tagService = inject(TagService);
  private route = inject(ActivatedRoute);
  private dialog = inject(Dialog);

  private tagId: Signal<string | null> = computed(() => this.route.snapshot.paramMap.get('id'));

  tagResource = rxResource({
    request: () => this.tagId(),
    loader: ({ request: id }) => {
      return this.tagService.getTagById(id!);
    },
  });

  tag = computed(() => this.tagResource.value());
  isLoading = computed(() => this.tagResource.isLoading());
  error = computed(() => {
    const err = this.tagResource.error();
    return err ? 'Failed to load tag details. Please try again later.' : null;
  });

  showUpdateModal(): void {
    if (!this.tag()) return;

    const dialogRef = this.dialog.open(CreateUpdateTagModal, {
      width: '400px',
      hasBackdrop: true,
      data: { tag: this.tag() },
    });

    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.tagResource.reload();
      }
    });
  }
}
