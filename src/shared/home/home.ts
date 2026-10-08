import { Component, signal } from '@angular/core';
import { Header } from '../header/header';
import { Sidenav } from '../sidenav/sidenav';
import { RouterOutlet } from '@angular/router';
import { AppLoaderComponent } from '../app-loader/app-loader';

@Component({
  selector: 'app-home',
  imports: [Header, Sidenav, RouterOutlet, AppLoaderComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  readonly isSidebarCollapsed = signal(false);

  toggleSidebar(): void {
    this.isSidebarCollapsed.update((value) => !value);
  }
}
