import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ToastComponent } from './components/ui/toast/toast.component';
import { AccountService } from './services/account.service';
import { IconRegistryService } from './services/icon-registry.service';
import { ToastService } from './services/toast.service';

@Component({
  selector: 'ts-root',
  imports: [RouterOutlet, FontAwesomeModule, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  private accountService = inject(AccountService);
  private router = inject(Router);
  private iconRegistry = inject(IconRegistryService);

  library = inject(FaIconLibrary);
  toastsService = inject(ToastService);
  title = 'TravelSidecar';

  constructor() {
    this.iconRegistry.registerIcons();
  }
}
