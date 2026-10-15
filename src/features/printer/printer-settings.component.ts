import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { PrinterService } from '../../services/printer/printer.service';
import { PrinterSettingsService } from '../../services/printer/printer-settings.service';
import { PrinterProfile, ReceiptWidth } from '../../services/printer/printer.types';

@Component({
  selector: 'app-printer-settings',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule, MatButtonModule],
  template: `
    <div class="printer-settings">
      <h2>Printer Settings</h2>

      <div class="settings-row">
        <!-- Printer -->
        <mat-form-field appearance="outline">
          <mat-label>Printer</mat-label>

          <mat-select [value]="selectedPrinter()" (selectionChange)="setPrinter($event.value)">
            @for (printer of printers(); track printer) {
              <mat-option [value]="printer">
                {{ printer }}
              </mat-option>
            }
          </mat-select>
        </mat-form-field>

        <!-- Receipt Width -->
        <mat-form-field appearance="outline">
          <mat-label>Receipt Width</mat-label>

          <mat-select [value]="selectedWidth()" (selectionChange)="setWidth($event.value)">
            @for (width of receiptWidths; track width) {
              <mat-option [value]="width">
                {{ width }}
              </mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>

      @if (loading()) {
        <p>Loading printers...</p>
      }

      @if (errorMessage()) {
        <p>{{ errorMessage() }}</p>
      }

      <div class="button-row">
        <button matButton="filled" type="button" (click)="save()" [disabled]="loading()">
          Save Printer
        </button>
      </div>
    </div>
  `,
  styleUrl: './printer-settings.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrinterSettingsComponent implements OnInit {
  private readonly printerService = inject(PrinterService);
  private readonly printerSettings = inject(PrinterSettingsService);

  readonly printers = signal<string[]>([]);
  readonly selectedPrinter = signal<string>('');
  readonly selectedWidth = signal<ReceiptWidth>('58mm');

  readonly receiptWidths: ReceiptWidth[] = ['58mm', '80mm', '4inch'];

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.loadPrinters();
  }

  async loadPrinters(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const printers = await this.printerService.getPrinters();

      this.printers.set(printers);

      const savedProfile = this.printerSettings.getPrinterProfile();

      if (savedProfile) {
        this.selectedPrinter.set(savedProfile.name);
        this.selectedWidth.set(savedProfile.receiptWidth);

        const printerAvailable = printers.some((printer) => printer === savedProfile.name);

        if (!printerAvailable) {
          this.errorMessage.set(
            `Saved printer "${savedProfile.name}" is not available. Please connect it or select another printer.`,
          );
        }

        return;
      }

      // No printer has been saved yet.
      // Do not automatically select the first printer.
      this.selectedPrinter.set('');
    } catch (error) {
      console.error('Failed to load printers:', error);

      this.errorMessage.set('Unable to connect to QZ Tray or load printers.');
    } finally {
      this.loading.set(false);
    }
  }

  save(): void {
    const printerName = this.selectedPrinter();

    if (!printerName) {
      this.errorMessage.set('Please select a printer.');
      return;
    }

    const profile: PrinterProfile = {
      id: `printer-${printerName}`,
      name: printerName,
      receiptWidth: this.selectedWidth(),
      description: 'Billing printer',
    };

    this.printerSettings.setPrinterProfile(profile);

    this.errorMessage.set('');
  }

  setPrinter(name: string): void {
    this.selectedPrinter.set(name);
    this.errorMessage.set('');
  }

  setWidth(width: ReceiptWidth): void {
    this.selectedWidth.set(width);
  }
}
