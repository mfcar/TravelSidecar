import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { TagService } from '../../../services/tag.service';
import { TagHeaderComponent } from '../../headers/tag-header/tag-header.component';
import { CreateUpdateTagModal } from '../../modals/tags/create-update-tag/create-update-tag.modal';
import { TabLinkItem, TabLinksComponent } from '../../tabs/tab-links/tab-links.component';
import { StickyListToolsComponent } from '../../tools/sticky-list-tools/sticky-list-tools.component';
import { AlertComponent } from '../../ui/alert/alert.component';
import { LoadingIndicatorComponent } from '../../ui/loading-indicator/loading-indicator.component';

@Component({
  selector: 'ts-tag-container',
  imports: [
    TabLinksComponent,
    RouterOutlet,
    TagHeaderComponent,
    StickyListToolsComponent,
    LoadingIndicatorComponent,
    AlertComponent,
  ],
  templateUrl: './tag-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagContainer {
  private route = inject(ActivatedRoute);
  private tagService = inject(TagService);
  private dialog = inject(Dialog);

  tagId = computed(() => this.route.snapshot.paramMap.get('id'));

  tagResource = rxResource({
    request: () => this.tagId(),
    loader: ({ request }) => {
      return this.tagService.getTagById(request!);
    },
  });

  tagTabs = signal<TabLinkItem[]>([
    { label: 'Journeys', route: './journeys', exact: true },
    { label: 'Bucket List', route: './bucket-list' },
  ]);

  tag = computed(() => this.tagResource.value());
  isLoading = computed(() => this.tagResource.isLoading());
  error = computed(() => {
    const err = this.tagResource.error();
    return err ? 'Failed to load tag details. Please try again later.' : null;
  });

  onEditTag(): void {
    const currentTag = this.tag();
    if (!currentTag) return;

    const dialogRef = this.dialog.open(CreateUpdateTagModal, {
      data: { tag: currentTag },
    });

    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.tagResource.reload();
      }
    });
  }
}
