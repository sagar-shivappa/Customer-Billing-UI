import { Component, inject, signal } from '@angular/core';
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
import { Customer } from '../../models/customer.model';
import { CustomerService } from '../../services/customer.service';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';

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
  private readonly customerService = inject(CustomerService);
  private readonly router = inject(Router);

  customer = signal<Customer | null>(null);
  customerNotFound = signal(false);
  isCheckingCustomer = signal(false);

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

  constructor() {
    this.customerForm
      .get('customerId')
      ?.valueChanges.pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((phone) => {
        this.lookupCustomer(phone ?? '');
      });
  }

  private lookupCustomer(phone: string): void {
    const value = phone?.trim();

    this.customer.set(null);
    this.customerNotFound.set(false);

    if (!value || value.length !== 10) {
      return;
    }

    this.isCheckingCustomer.set(true);

    this.customerService.getCustomerByPhone(value).subscribe({
      next: (customer) => {
        this.customer.set(customer.data);
        this.customerNotFound.set(false);
        this.isCheckingCustomer.set(false);
      },

      error: (error) => {
        this.isCheckingCustomer.set(false);

        if (error.status === 404) {
          this.customer.set(null);
          this.customerNotFound.set(true);
          return;
        }

        console.error('Customer lookup failed:', error);
      },
    });
  }

  addNewCustomer(): void {
    this.router.navigate(['/customer']);
  }

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
