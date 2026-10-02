import { Component, signal } from '@angular/core';
import { Header } from '../header/header';
import { Sidenav } from '../sidenav/sidenav';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [Header, Sidenav, RouterOutlet],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  readonly isSidebarCollapsed = signal(false);

  toggleSidebar(): void {
    this.isSidebarCollapsed.update((value) => !value);
  }
}
