import { Injectable, inject } from '@angular/core';
import { Billing } from '../billing.service';
import qz from 'qz-tray';

import { ReceiptFormatterService } from './receipt-formatter.service';
import { PrinterSettingsService } from './printer-settings.service';
import { PrinterProfile } from './printer.types';

@Injectable({
  providedIn: 'root',
})
export class PrinterService {
  private readonly receiptFormatter = inject(ReceiptFormatterService);
  private readonly printerSettings = inject(PrinterSettingsService);

  private readonly defaultPrinterProfile: PrinterProfile = {
    id: 'default-billing-printer',
    name: 'POS-58',
    receiptWidth: '58mm',
    description: 'Default billing printer',
  };

  private securityConfigured = false;

  /**
   * Configure QZ Tray security.
   *
   * The certificate is public and can be returned to Angular.
   * The private key never leaves the backend.
   */

  private configureSecurity(): void {
    if (this.securityConfigured) {
      return;
    }

    qz.security.setCertificatePromise(
      (resolve: (certificate: string) => void, reject: (error: unknown) => void) => {
        fetch('http://localhost:5000/api/qz/certificate', {
          cache: 'no-store',
        })
          .then(async (response) => {
            if (!response.ok) {
              throw new Error(`Failed to load QZ certificate: ${response.status}`);
            }

            return response.text();
          })
          .then((certificate) => {
            resolve(certificate);
          })
          .catch((error: unknown) => {
            reject(error);
          });
      },
    );

    qz.security.setSignatureAlgorithm('SHA256');

    qz.security.setSignaturePromise((dataToSign: string) => {
      return (resolve: (signature: string) => void, reject: (error: unknown) => void) => {
        fetch('http://localhost:5000/api/qz/sign', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: dataToSign,
          }),
        })
          .then(async (response) => {
            if (!response.ok) {
              throw new Error(`Failed to sign QZ request: ${response.status}`);
            }

            return response.json();
          })
          .then((result) => {
            if (!result?.signature) {
              throw new Error('QZ signing response did not contain a signature.');
            }

            resolve(result.signature);
          })
          .catch((error: unknown) => {
            console.error('QZ signing error:', error);
            reject(error);
          });
      };
    });

    this.securityConfigured = true;
  }

  async connect(): Promise<void> {
    this.configureSecurity();

    if (!qz.websocket.isActive()) {
      await qz.websocket.connect();
    }
  }

  async getPrinters(): Promise<string[]> {
    await this.connect();

    return qz.printers.find();
  }

  async getDefaultPrinter(): Promise<string> {
    await this.connect();

    return qz.printers.getDefault();
  }

  getPrinterProfile(): PrinterProfile {
    return this.printerSettings.getPrinterProfile() ?? this.defaultPrinterProfile;
  }

  /**
   * Checks the current status of the selected printer.
   *
   * This is different from qz.printers.find().
   * find() only tells us that the Windows printer exists.
   * This method checks the actual printer status reported by QZ Tray.
   */
  private async checkPrinterStatus(printerName: string): Promise<void> {
    await qz.printers.startListening(printerName);

    return new Promise<void>((resolve, reject) => {
      let completed = false;

      const cleanup = async (): Promise<void> => {
        try {
          await qz.printers.stopListening();
        } catch {
          // Ignore listener cleanup errors.
        }
      };

      const finishSuccess = async (): Promise<void> => {
        if (completed) {
          return;
        }

        completed = true;

        await cleanup();
        resolve();
      };

      const finishError = async (message: string): Promise<void> => {
        if (completed) {
          return;
        }

        completed = true;

        await cleanup();
        reject(new Error(message));
      };

      qz.printers.setPrinterCallbacks(async (event: any) => {
        if (completed) {
          return;
        }

        if (event?.printerName !== printerName) {
          return;
        }

        const status = String(event?.statusText ?? '').toUpperCase();

        console.log('Printer status:', {
          printerName: event?.printerName,
          statusText: event?.statusText,
          severity: event?.severity,
          message: event?.message,
        });

        if (status === 'OFFLINE' || status === 'ERROR' || status === 'ABORTED') {
          await finishError(`Printer "${printerName}" is unavailable (${status}).`);

          return;
        }

        await finishSuccess();
      });

      qz.printers.getStatus().catch(async (error: unknown) => {
        await finishError(`Unable to check printer "${printerName}".`);

        console.error('Printer status error:', error);
      });

      /**
       * Safety timeout.
       *
       * If QZ Tray does not return a status within this time,
       * we do NOT submit the print job.
       */
      setTimeout(async () => {
        if (completed) {
          return;
        }

        await finishError(`Unable to confirm that printer "${printerName}" is available.`);
      }, 3000);
    });
  }

  async printBill(bill: Billing): Promise<void> {
    try {
      await this.connect();

      const printerProfile = this.getPrinterProfile();

      await this.checkPrinterStatus(printerProfile.name);

      const config = qz.configs.create(printerProfile.name);

      const data = this.receiptFormatter.format(bill, printerProfile.receiptWidth);

      await qz.print(config, data);
    } catch (error) {
      console.error('Printer error:', error);
      throw error;
    }
  }
}
