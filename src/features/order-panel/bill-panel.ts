import { Component, inject, signal } from '@angular/core';
import { Billing, BillingService, PaymentType } from '../../services/billing.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { app_config } from '../../app/core/config/app.config';
import { MatSelect, MatOption } from '@angular/material/select';
import { FormBuilder, ReactiveFormsModule, ɵInternalFormsSharedModule } from '@angular/forms';
import { CustomerService } from '../../services/customer.service';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { PrinterService } from '../../services/printer/printer.service';

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
  protected readonly customerService = inject(CustomerService);
  private readonly router = inject(Router);
  private readonly printerService = inject(PrinterService);

  customerNotFound = signal(false);

  readonly orderSummary = this.billingService.orderSummary;
  paymentTypes: string[] = ['Cash', 'UPI', 'Credit'];
  allowPriceEdit = app_config.editable_price;

  readonly customerForm = this.fb.group({
    customerId: this.fb.control<string>(''),
    paymentType: this.fb.control<PaymentType>('Cash'),
  });

  readonly displayedColumns: Array<'product' | 'quantity' | 'price' | 'total' | 'action'> = [
    'product',
    'price',
    'quantity',
    'total',
    'action',
  ];

  createdBill = signal<Billing | null>(null);

  constructor() {
    this.customerForm
      .get('customerId')
      ?.valueChanges.pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((phone) => {
        this.lookupCustomer(phone ?? '');
      });
  }

  // async testPrinter(): Promise<void> {
  //   try {
  //     await this.printerService.printBill(bill: Billing)

  //     console.log('Receipt printed successfully');
  //   } catch (error) {
  //     console.error('Print failed:', error);
  //   }
  // }

  private lookupCustomer(phone: string): void {
    const value = phone?.trim();
    this.customerService.customer.set(null);
    this.customerNotFound.set(false);

    if (!value || value.length !== 10) {
      return;
    }

    this.customerService.getCustomerByPhone(value).subscribe({
      next: (customer) => {
        this.customerService.customer.set(customer.data);
        this.customerNotFound.set(false);
      },

      error: (error) => {
        if (error.status === 404) {
          this.customerService.customer.set(null);
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

  clearOrder(): void {
    this.billingService.clearOrder();

    this.customerForm.reset({
      customerId: '',
      paymentType: 'Cash',
    });
  }

  order(): void {
    this.billingService.customerDetails.set({
      customerId: this.customerForm.value.customerId ?? '',
      paymentType: this.customerForm.value.paymentType ?? 'Cash',
    });

    this.billingService.order().subscribe({
      next: (response) => {
        const bill = response.data;
        // Bill is already saved successfully
        this.createdBill.set(bill);

        this.clearOrder();

        // Printing is optional
        this.printerService.printBill(bill).catch((error) => {
          console.warn('Bill saved, but receipt could not be printed:', error);
        });
      },

      error: (error) => {
        console.error('Failed to create bill:', error);
      },
    });
  }
}
