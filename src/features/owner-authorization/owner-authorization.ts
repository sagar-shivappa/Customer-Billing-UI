import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogActions, MatDialogContent } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthorizationService } from '../../services/authorization.service';
import { OwnerProfileService } from '../../services/owner.service';

@Component({
  selector: 'app-owner-authorization',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogActions,
    MatDialogContent,
  ],
  templateUrl: './owner-authorization.html',
  styleUrl: './owner-authorization.css',
})
export class OwnerAuthorizationComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<OwnerAuthorizationComponent>);
  private readonly authorizationService = inject(AuthorizationService);
  private readonly ownerProfileService = inject(OwnerProfileService);

  readonly passwordConfigured = this.ownerProfileService.profile().passwordConfigured;

  hidePassword = true;
  hideConfirmPassword = true;
  errorMessage = '';

  readonly form = this.fb.nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(4)]],
    confirmPassword: [''],
  });

  constructor() {
    if (this.passwordConfigured) {
      this.form.controls.confirmPassword.clearValidators();
    } else {
      this.form.controls.confirmPassword.setValidators([
        Validators.required,
        Validators.minLength(4),
      ]);
    }

    this.form.controls.confirmPassword.updateValueAndValidity();
  }

  authorize(): void {
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { password, confirmPassword } = this.form.getRawValue();

    if (!this.passwordConfigured && password !== confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.authorizationService
      .authorize(password, this.passwordConfigured ? undefined : confirmPassword)
      .subscribe({
        next: (response) => {
          this.ownerProfileService.updatePasswordConfigured(response.authorized);

          this.dialogRef.close(true);
        },
        error: (error) => {
          this.errorMessage = error?.error?.message ?? 'Authorization failed.';
        },
      });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
