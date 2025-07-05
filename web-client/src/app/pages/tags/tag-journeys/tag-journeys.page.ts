import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { ButtonComponent } from '../../../components/buttons/button/button.component';
import { TagContainer } from '../../../components/containers/tag/tag-container.component';
import { PaginationComponent } from '../../../components/ui/pagination/pagination.component';
import { TagService } from '../../../services/tag.service';
import { UserDateFormatPipe } from '../../../shared/pipes/user-date-format.pipe';

@Component({
  selector: 'ts-tag-journeys',
  imports: [RouterLink, ButtonComponent, UserDateFormatPipe, PaginationComponent],
  templateUrl: './tag-journeys.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagJourneysPage {
  private tagContainer = inject(TagContainer);
  private tagService = inject(TagService);

  tag = computed(() => this.tagContainer.tag());

  currentPage = signal(1);
  pageSize = signal(25);

  journeysResource = rxResource({
    request: computed(() => ({
      tagId: this.tag()?.id,
      page: this.currentPage(),
      pageSize: this.pageSize(),
    })),
    loader: ({ request }) => {
      if (!request.tagId) {
        return of({
          items: [],
          totalCount: 0,
          currentPage: 1,
          pageSize: 25,
          totalPages: 0,
        });
      }
      return this.tagService.getJourneysByTag(request.tagId, request.page, request.pageSize);
    },
  });

  journeys = computed(() => this.journeysResource.value()?.items || []);
  totalPages = computed(() => this.journeysResource.value()?.totalPages || 0);

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }
}
