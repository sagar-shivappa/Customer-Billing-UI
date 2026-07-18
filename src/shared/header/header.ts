import { Component, inject, output } from '@angular/core';
import { OwnerProfileService } from '../../services/owner.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  readonly menuClicked = output<void>();
  readonly ownerService = inject(OwnerProfileService);
}
