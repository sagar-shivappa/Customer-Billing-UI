import { Component, signal } from '@angular/core';
import { Header } from '../header/header';
import { Sidenav } from '../sidenav/sidenav';
import { Footer } from '../footer/footer';
import { RouterOutlet } from '@angular/router';
import { BillPanel } from '../bill-panel/bill-panel';

@Component({
  selector: 'app-home',
  imports: [Header, Sidenav, Footer, RouterOutlet, BillPanel],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  readonly isSidebarCollapsed = signal(false);

  toggleSidebar(): void {
    this.isSidebarCollapsed.update((value) => !value);
  }
}
