import { Component, inject, signal } from '@angular/core';
import { BillingService } from '../../services/billing.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { app_config } from '../../app/core/config/app.config';

@Component({
  selector: 'app-bill-panel',
  imports: [
    CommonModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './bill-panel.html',
  styleUrl: './bill-panel.css',
})
export class BillPanel {
  private readonly billingService = inject(BillingService);
  readonly orderSummary = this.billingService.orderSummary;
  allowPriceEdit = app_config.editable_price;

  readonly displayedColumns: Array<'product' | 'quantity' | 'price' | 'total' | 'action'> = [
    'product',
    'price',
    'quantity',
    'total',
    'action',
  ];

  updateQuantity(productCode: string, event: Event): void {
    const quantity = Number((event.target as HTMLInputElement).value);
    this.billingService.updateQuantity(productCode, quantity);
  }

  updatePrice(productCode: string, event: Event): void {
    const price = Number((event.target as HTMLInputElement).value);
    this.billingService.updateUnitPrice(productCode, price);
  }

  removeItem(productCode: string): void {
    this.billingService.removeItem(productCode);
  }
  clearOrder() {
    this.billingService.clearOrder();
  }
}
