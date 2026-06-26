import { Component, input } from '@angular/core';
import { NAVIGATION_ITEMS } from '../../app/core/config/navigation.config';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-sidenav',
  imports: [RouterLink, RouterLinkActive, MatListModule, MatIconModule],
  templateUrl: './sidenav.html',
  styleUrl: './sidenav.css',
})
export class Sidenav {
  readonly collapsed = input(false);
  readonly menuItems = NAVIGATION_ITEMS;
}
