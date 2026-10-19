import { Injectable, inject } from '@angular/core';

import { OwnerProfileService } from './owner.service';
import { SOFTWARE_LICENSE_CONFIG } from '../app/core/config/software-license.config';

export type LicenseDuration = '' | 'trial' | '3-months' | '6-months' | '1-year';

export interface LicenseDurationOption {
  value: Exclude<LicenseDuration, ''>;
  label: string;
}

export interface LicenseStatus {
  expiryDate: string;
  formattedExpiryDate: string;
  daysRemaining: number;
}

@Injectable({
  providedIn: 'root',
})
export class SoftwareLicenseService {
  private readonly ownerProfileService = inject(OwnerProfileService);

  readonly licenseDurations: LicenseDurationOption[] = [
    {
      value: 'trial',
      label: 'Trial Version',
    },
    {
      value: '3-months',
      label: '3 Months',
    },
    {
      value: '6-months',
      label: '6 Months',
    },
    {
      value: '1-year',
      label: '1 Year',
    },
  ];

  /**
   * Validate an agent code.
   */
  isValidAgentCode(agentCode: string): boolean {
    const enteredCode = agentCode.trim().toUpperCase();

    if (!enteredCode) {
      return false;
    }

    return SOFTWARE_LICENSE_CONFIG.agentCodes.some((code) => code.toUpperCase() === enteredCode);
  }

  /**
   * Get the current license status.
   */
  getLicenseStatus(): LicenseStatus {
    const expiryDate = this.ownerProfileService.profile().softwareExpiryDate;

    if (!expiryDate) {
      return {
        expiryDate: '',
        formattedExpiryDate: '',
        daysRemaining: 0,
      };
    }

    const expiry = this.parseIsoDate(expiryDate);
    const today = this.startOfDay(new Date());

    const difference = expiry.getTime() - today.getTime();

    return {
      expiryDate,
      formattedExpiryDate: this.formatDate(expiry),
      daysRemaining: Math.max(0, Math.ceil(difference / this.millisecondsPerDay())),
    };
  }

  shouldShowExpiryWarning(): boolean {
    const status = this.getLicenseStatus();

    return !!status.expiryDate && status.daysRemaining <= 10;
  }

  /**
   * Calculate the expiry date for a selected duration.
   *
   * Active license:
   * Existing expiry + selected duration
   *
   * Expired/no license:
   * Today + selected duration
   */
  calculateExpiry(duration: Exclude<LicenseDuration, ''>): Date {
    const profile = this.ownerProfileService.profile();

    const today = this.startOfDay(new Date());

    const existingExpiry = profile.softwareExpiryDate
      ? this.parseIsoDate(profile.softwareExpiryDate)
      : null;

    const baseDate = existingExpiry && existingExpiry > today ? existingExpiry : today;

    return this.addDuration(baseDate, duration);
  }

  /**
   * Activate the selected license and save it to Owner Profile.
   */
  activateLicense(duration: Exclude<LicenseDuration, ''>): LicenseStatus {
    const expiryDate = this.calculateExpiry(duration);

    const softwareExpiryDate = this.toIsoDate(expiryDate);

    const profile = this.ownerProfileService.profile();

    const updatedProfile = {
      ...profile,
      softwareExpiryDate,
    };

    this.ownerProfileService.saveProfile(updatedProfile);

    const today = this.startOfDay(new Date());

    const difference = expiryDate.getTime() - today.getTime();

    return {
      expiryDate: softwareExpiryDate,
      formattedExpiryDate: this.formatDate(expiryDate),
      daysRemaining: Math.max(0, Math.ceil(difference / this.millisecondsPerDay())),
    };
  }

  isLicenseActive(): boolean {
    const status = this.getLicenseStatus();

    // No license or expired license
    if (!status.expiryDate || status.daysRemaining <= 0) {
      return false;
    }

    return true;
  }

  /**
   * Add the selected duration to a date.
   */
  private addDuration(date: Date, duration: Exclude<LicenseDuration, ''>): Date {
    const result = new Date(date);

    switch (duration) {
      case 'trial':
        result.setDate(result.getDate() + 10);
        break;

      case '3-months':
        result.setMonth(result.getMonth() + 3);
        break;

      case '6-months':
        result.setMonth(result.getMonth() + 6);
        break;

      case '1-year':
        result.setFullYear(result.getFullYear() + 1);
        break;
    }

    return this.startOfDay(result);
  }

  /**
   * Convert YYYY-MM-DD into a local Date.
   *
   * Do not use new Date('YYYY-MM-DD')
   * because that is interpreted as UTC.
   */
  private parseIsoDate(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);

    return new Date(year, month - 1, day);
  }

  /**
   * Set date to midnight.
   */
  private startOfDay(date: Date): Date {
    const result = new Date(date);

    result.setHours(0, 0, 0, 0);

    return result;
  }

  /**
   * Convert Date to YYYY-MM-DD.
   */
  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  /**
   * Format date for display.
   */
  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }

  private millisecondsPerDay(): number {
    return 1000 * 60 * 60 * 24;
  }

  formatExpiryDate(date: Date): string {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }
}
