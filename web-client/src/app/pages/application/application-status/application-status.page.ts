import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  resource,
  ResourceStatus,
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PageHeaderComponent } from '../../../components/ui/page-header/page-header.component';
import { SystemInfoService } from '../../../services/system-info.service';
import { UptimePipe } from '../../../shared/pipes/uptime.pipe';
import { UserDateFormatPipe } from '../../../shared/pipes/user-date-format.pipe';

@Component({
  selector: 'ts-application-status',
  imports: [PageHeaderComponent, UptimePipe, FontAwesomeModule, UserDateFormatPipe],
  providers: [DatePipe],
  templateUrl: './application-status.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationStatusPage {
  private systemInfoService = inject(SystemInfoService);

  systemStatusResource = resource({
    request: () => null,
    loader: () => this.systemInfoService.getSystemStatus().toPromise(),
  });

  systemStatus = computed(() => this.systemStatusResource.value());
  isLoading = computed(() => this.systemStatusResource.isLoading());
  hasError = computed(() => this.systemStatusResource.status() === ResourceStatus.Error);

  reloadSystemStatus(): void {
    this.systemStatusResource.reload();
  }
}
