import { Injectable } from '@angular/core';
import { PrinterProfile } from './printer.types';

@Injectable({
  providedIn: 'root',
})
export class PrinterSettingsService {
  private readonly storageKey = 'billing-printer-profile';

  setPrinterProfile(profile: PrinterProfile): void {
    localStorage.setItem(this.storageKey, JSON.stringify(profile));
  }

  getPrinterProfile(): PrinterProfile | null {
    const storedProfile = localStorage.getItem(this.storageKey);

    if (!storedProfile) {
      return null;
    }

    try {
      return JSON.parse(storedProfile) as PrinterProfile;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }

  clearPrinterProfile(): void {
    localStorage.removeItem(this.storageKey);
  }
}
