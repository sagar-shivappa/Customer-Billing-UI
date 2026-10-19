import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { SOFTWARE_SUPPORT_CONFIG } from '../../../src/app/core/config/software-support.config';

import { LicenseDuration, SoftwareLicenseService } from '../../services/software-license.service';

@Component({
  selector: 'app-customer-care',
  standalone: true,

  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],

  templateUrl: './customer-care.html',
  styleUrl: './customer-care.css',
})
export class CustomerCare implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly licenseService = inject(SoftwareLicenseService);

  readonly supportConfig = SOFTWARE_SUPPORT_CONFIG;

  readonly licenseDurations = this.licenseService.licenseDurations;

  agentCodeValid = false;

  currentExpiryDate = '';

  newExpiryDate = '';

  daysRemaining = 0;

  successMessage = '';

  errorMessage = '';

  licenseForm = this.fb.nonNullable.group({
    agentCode: ['', Validators.required],
    duration: ['' as LicenseDuration],
  });

  ngOnInit(): void {
    this.loadLicenseStatus();
  }

  /**
   * Load current license status.
   */
  private loadLicenseStatus(): void {
    const status = this.licenseService.getLicenseStatus();

    this.currentExpiryDate = status.formattedExpiryDate;
    this.daysRemaining = status.daysRemaining;
  }

  /**
   * Validate agent code.
   */
  validateAgentCode(): void {
    const enteredCode = this.licenseForm.controls.agentCode.value.trim().toUpperCase();

    this.licenseForm.controls.agentCode.setValue(enteredCode);

    this.agentCodeValid = this.licenseService.isValidAgentCode(enteredCode);

    this.successMessage = '';
    this.errorMessage = '';
    this.newExpiryDate = '';

    if (!this.agentCodeValid) {
      this.licenseForm.controls.duration.reset();

      if (enteredCode) {
        this.errorMessage = 'Invalid agent code.';
      }
    }
  }

  /**
   * Preview the new expiry date.
   */
  calculateExpiry(): void {
    const duration = this.licenseForm.controls.duration.value;

    if (!this.agentCodeValid || !duration) {
      this.newExpiryDate = '';
      return;
    }

    const expiryDate = this.licenseService.calculateExpiry(duration);

    this.newExpiryDate = this.licenseService.formatExpiryDate(expiryDate);
  }

  /**
   * Activate selected license.
   */
  activateLicense(): void {
    if (!this.agentCodeValid) {
      this.errorMessage = 'Please enter a valid agent code.';
      return;
    }

    const duration = this.licenseForm.controls.duration.value;

    if (!duration) {
      this.errorMessage = 'Please select a license duration.';
      return;
    }

    const status = this.licenseService.activateLicense(duration);

    this.currentExpiryDate = status.formattedExpiryDate;
    this.daysRemaining = status.daysRemaining;

    this.newExpiryDate = '';

    this.successMessage = `License activated successfully. New expiry date: ${status.formattedExpiryDate}`;

    this.errorMessage = '';

    this.licenseForm.reset();

    this.agentCodeValid = false;
  }
}
