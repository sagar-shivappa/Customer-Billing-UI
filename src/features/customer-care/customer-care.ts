import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

import { SOFTWARE_SUPPORT_CONFIG } from '../../../src/app/core/config/software-support.config';

@Component({
  selector: 'app-customer-care',
  imports: [MatCardModule, MatDividerModule, MatIconModule],
  templateUrl: './customer-care.html',
  styleUrl: './customer-care.css',
})
export class CustomerCare {
  readonly supportConfig = SOFTWARE_SUPPORT_CONFIG;
}
