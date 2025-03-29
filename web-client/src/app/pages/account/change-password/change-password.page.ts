import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { ButtonComponent } from '../../../components/buttons/button/button.component';
import { TextInputComponent } from '../../../components/forms/text-input/text-input.component';
import { AlertComponent } from '../../../components/ui/alert/alert.component';
import { ApplicationLogoComponent } from '../../../components/ui/application-logo/application-logo.component';
import { AccountService } from '../../../services/account.service';
import { UserPreferencesService } from '../../../services/user-preferences.service';

@Component({
  selector: 'ts-change-password',
  imports: [
    ReactiveFormsModule,
    TextInputComponent,
    ButtonComponent,
    AlertComponent,
    ApplicationLogoComponent,
  ],
  templateUrl: './change-password.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangePasswordPage {
  private formBuilder = inject(FormBuilder);
  private accountService = inject(AccountService);
  private preferencesService = inject(UserPreferencesService);
  private router = inject(Router);

  public isFirstLogin = signal<boolean>(false);
  public errorMessage = signal<string | null>(null);
  public successMessage = signal<string | null>(null);
  public isLoading = signal<boolean>(false);

  passwordForm: FormGroup = this.formBuilder.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
    },
    { validators: this.passwordMatchValidator },
  );

  constructor() {
    this.isFirstLogin.set(this.accountService.requirePasswordChange());
  }

  private passwordMatchValidator(fg: FormGroup) {
    const newPassword = fg.get('newPassword')?.value;
    const confirmPassword = fg.get('confirmPassword')?.value;

    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.passwordForm.invalid) {
      return;
    }

    if (
      this.passwordForm.get('newPassword')?.value !==
      this.passwordForm.get('confirmPassword')?.value
    ) {
      this.errorMessage.set("Passwords don't match");
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const request = {
      currentPassword: this.passwordForm.get('currentPassword')?.value,
      newPassword: this.passwordForm.get('newPassword')?.value,
    };

    this.accountService.changePassword(request).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Password successfully updated');

        setTimeout(() => {
          this.preferencesService
            .isSetupComplete()
            .pipe(take(1))
            .subscribe((isComplete) => {
              if (!isComplete) {
                this.router.navigate(['/account/setup']);
              } else {
                this.router.navigate(['/home']);
              }
            });
        }, 1500);
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.error && typeof err.error === 'string') {
          this.errorMessage.set(err.error);
        } else if (err.error && err.error.message) {
          this.errorMessage.set(err.error.message);
        } else {
          this.errorMessage.set('Failed to change password. Please try again.');
        }
      },
    });
  }

  onLogout() {
    this.accountService.logout();
    this.router.navigate(['/login']);
  }
}
