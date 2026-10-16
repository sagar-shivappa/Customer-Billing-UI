import { Component, inject, output } from '@angular/core';
import { OwnerProfileService } from '../../services/owner.service';
import { SOFTWARE_SUPPORT_CONFIG } from '../../app/core/config/software-support.config';

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
}
