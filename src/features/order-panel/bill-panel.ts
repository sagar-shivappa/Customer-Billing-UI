import { Component, inject } from '@angular/core';
import { BillingService } from '../../services/billing.service';

@Component({
  selector: 'app-bill-panel',
  imports: [],
  templateUrl: './bill-panel.html',
  styleUrl: './bill-panel.css',
})
export class BillPanel {
  private readonly billingService = inject(BillingService);
  readonly orderSummary = this.billingService.orderSummary;
}
