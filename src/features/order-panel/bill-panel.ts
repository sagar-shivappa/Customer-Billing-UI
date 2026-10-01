import { Component, inject } from '@angular/core';
import { BillingService } from '../../services/billing.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { app_config } from '../../app/core/config/app.config';
import { MatSelect, MatOption } from '@angular/material/select';
import { FormBuilder, ReactiveFormsModule, ɵInternalFormsSharedModule } from '@angular/forms';

@Component({
  selector: 'app-bill-panel',
  imports: [
    CommonModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelect,
    MatOption,
    ɵInternalFormsSharedModule,
    ReactiveFormsModule,
  ],
  templateUrl: './bill-panel.html',
  styleUrl: './bill-panel.css',
})
export class BillPanel {
  private readonly billingService = inject(BillingService);
  private readonly fb = inject(FormBuilder);
  readonly orderSummary = this.billingService.orderSummary;
  paymentTypes: string[] = ['Cash', 'UPI', 'Credit'];
  allowPriceEdit = app_config.editable_price;

  readonly customerForm = this.fb.group({
    customerId: [''],
    paymentType: ['Cash'],
  });

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

  // updatePrice(productCode: string, event: Event): void {
  //   const price = Number((event.target as HTMLInputElement).value);
  //   this.billingService.updateUnitPrice(productCode, price);
  // }

  removeItem(productCode: string): void {
    this.billingService.removeItem(productCode);
  }

  clearOrder() {
    this.billingService.clearOrder();
    this.customerForm.reset();
  }

  order() {
    this.billingService.customerDetails.set({
      customerId: this.customerForm.value.customerId ?? '',
      paymentType: this.customerForm.value.paymentType ?? 'cash',
    });
    this.billingService.order();
  }
}
