import { Component, computed, inject, input } from '@angular/core';
import { NAVIGATION_ITEMS } from '../../app/core/config/navigation.config';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltip } from '@angular/material/tooltip';
import { AuthorizationService } from '../../services/authorization.service';

@Component({
  selector: 'app-sidenav',
  imports: [RouterLink, RouterLinkActive, MatListModule, MatIconModule, MatTooltip],
  templateUrl: './sidenav.html',
  styleUrl: './sidenav.css',
})
export class Sidenav {
  readonly collapsed = input(false);

  private readonly authorizationService = inject(AuthorizationService);

  readonly menuItems = computed(() => {
    const authorized = this.authorizationService.authorized();

    return NAVIGATION_ITEMS.filter((item) => item.route !== '/reports' || authorized);
  });
}
