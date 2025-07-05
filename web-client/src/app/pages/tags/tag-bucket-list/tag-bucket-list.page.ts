import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { TagBadgeComponent } from '../../../components/badges/tag-badge/tag-badge.component';
import { TagContainer } from '../../../components/containers/tag/tag-container.component';
import { PaginationComponent } from '../../../components/ui/pagination/pagination.component';
import { BucketListItemType } from '../../../models/bucket-list.model';
import { TagService } from '../../../services/tag.service';
import { UserDateFormatPipe } from '../../../shared/pipes/user-date-format.pipe';

@Component({
  selector: 'ts-tag-bucket-list',
  imports: [TagBadgeComponent, UserDateFormatPipe, PaginationComponent],
  templateUrl: './tag-bucket-list.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagBucketListPage {
  private tagContainer = inject(TagContainer);
  private tagService = inject(TagService);

  tag = computed(() => this.tagContainer.tag());

  currentPage = signal(1);
  pageSize = signal(25);

  bucketListResource = rxResource({
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
      return this.tagService.getBucketListItemsByTag(request.tagId, request.page, request.pageSize);
    },
  });

  bucketListItems = computed(() => this.bucketListResource.value()?.items || []);
  totalPages = computed(() => this.bucketListResource.value()?.totalPages || 0);

  getBucketListItemTypeLabel(type: BucketListItemType): string {
    const typeLabels: Record<BucketListItemType, string> = {
      [BucketListItemType.Destination]: 'Destination',
      [BucketListItemType.Activity]: 'Activity',
      [BucketListItemType.Accommodation]: 'Accommodation',
      [BucketListItemType.Food]: 'Food',
      [BucketListItemType.Transportation]: 'Transportation',
      [BucketListItemType.Event]: 'Event',
      [BucketListItemType.Other]: 'Other',
    };
    return typeLabels[type] || 'Unknown';
  }

  getBucketListItemTypeIcon(type: BucketListItemType): string {
    const typeIcons: Record<BucketListItemType, string> = {
      [BucketListItemType.Destination]: 'location-dot',
      [BucketListItemType.Activity]: 'person-running',
      [BucketListItemType.Accommodation]: 'bed',
      [BucketListItemType.Food]: 'utensils',
      [BucketListItemType.Transportation]: 'car',
      [BucketListItemType.Event]: 'calendar-check',
      [BucketListItemType.Other]: 'circle-info',
    };
    return typeIcons[type] || 'circle-info';
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }
}
