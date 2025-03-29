import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonComponent } from '../../components/buttons/button/button.component';
import { TextInputComponent } from '../../components/forms/text-input/text-input.component';
import { AlertComponent } from '../../components/ui/alert/alert.component';
import { ApplicationLogoComponent } from '../../components/ui/application-logo/application-logo.component';
import { AccountService } from '../../services/account.service';
import { UserPreferencesService } from '../../services/user-preferences.service';

@Component({
  selector: 'ts-login',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    TextInputComponent,
    ButtonComponent,
    AlertComponent,
    ApplicationLogoComponent,
  ],
  templateUrl: './login.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage implements OnInit {
  private formBuilder = inject(FormBuilder);
  private accountService = inject(AccountService);
  private prefsService = inject(UserPreferencesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  public errorMessage = signal<string | null>('');
  public isLoading = signal<boolean>(false);

  private returnUrl = '/home';

  loginForm: FormGroup = this.formBuilder.group({
    emailUsername: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(250)]],
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(250)]],
    rememberMe: [false],
  });

  ngOnInit(): void {
    this.accountService.logout();
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
  }

  onSubmit(): void {
    this.errorMessage.set(null);
    this.isLoading.set(true);

    if (this.loginForm.valid) {
      this.accountService.login(this.loginForm.value).subscribe({
        next: () => {
          if (this.accountService.requirePasswordChange()) {
            this.router.navigate(['/account/change-password']);
            return;
          }

          this.router.navigateByUrl(this.returnUrl);
        },
        error: (err) => {
          if (err.status === 400 && err.error && err.error.errors) {
            this.errorMessage.set(err.error.errors);
          } else {
            this.errorMessage.set('Login failed. Please try again.');
          }
          this.isLoading.set(false);
        },
        complete: () => {
          this.isLoading.set(false);
        },
      });
    }
  }
}
