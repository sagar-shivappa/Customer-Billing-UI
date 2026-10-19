import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog';
import { SoftwareLicenseService } from '../services/software-license.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('customer-billing-ui');
  private readonly dialog = inject(MatDialog);
  private readonly licenseService = inject(SoftwareLicenseService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.checkLicenseExpiry();
  }

  private checkLicenseExpiry(): void {
    if (!this.licenseService.shouldShowExpiryWarning()) {
      return;
    }

    const status = this.licenseService.getLicenseStatus();

    const message =
      status.daysRemaining === 0
        ? `Your software license expired on ${status.formattedExpiryDate}. Please contact software support to renew your license.`
        : `Your software license will expire on ${status.formattedExpiryDate}. Only ${status.daysRemaining} ${status.daysRemaining === 1 ? 'day' : 'days'} remaining. Please contact software support to renew your license.`;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      data: {
        title:
          status.daysRemaining === 0
            ? 'Software License Expired'
            : 'Software License Expiring Soon',
        message,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.router.navigate(['/support']);
      }
    });
  }
}
