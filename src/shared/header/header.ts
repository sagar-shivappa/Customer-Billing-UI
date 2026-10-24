import { Component, inject, output } from '@angular/core';
import { OwnerProfileService } from '../../services/owner.service';
import { SOFTWARE_SUPPORT_CONFIG } from '../../app/core/config/software-support.config';
import { MatDialog } from '@angular/material/dialog';
import { OwnerAuthorizationComponent } from '../../features/owner-authorization/owner-authorization';
import { AuthorizationService } from '../../services/authorization.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  readonly supportConfig = SOFTWARE_SUPPORT_CONFIG;
  readonly menuClicked = output<void>();
  readonly ownerService = inject(OwnerProfileService);
  readonly authorizationService = inject(AuthorizationService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  toggleOwnerAuthorization(): void {
    if (this.authorizationService.authorized()) {
      this.authorizationService.logout();

      this.notificationService.info('Owner mode locked.');

      if (this.router.url === '/reports') {
        this.router.navigate(['/']);
      }
      return;
    }

    this.dialog.open(OwnerAuthorizationComponent, {
      width: '380px',
      maxWidth: 'calc(100vw - 32px)',
      disableClose: true,
    });
  }
}
