import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TagResponse } from '../../../models/tags.model';
import { UserDateFormatPipe } from '../../../shared/pipes/user-date-format.pipe';
import { TagBadgeComponent } from '../../badges/tag-badge/tag-badge.component';
import { ButtonComponent } from '../../buttons/button/button.component';
import { StatGroupComponent } from '../../stats/stat-group/stat-group.component';
import { StatComponent } from '../../stats/stat/stat.component';
import { PageHeaderComponent } from '../page-header/page-header.component';

@Component({
  selector: 'ts-tag-header',
  imports: [
    PageHeaderComponent,
    TagBadgeComponent,
    ButtonComponent,
    StatGroupComponent,
    StatComponent,
    UserDateFormatPipe,
  ],
  templateUrl: './tag-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagHeaderComponent {
  tag = input.required<TagResponse>();
  editTag = output<void>();

  onEditClick(): void {
    this.editTag.emit();
  }
}
