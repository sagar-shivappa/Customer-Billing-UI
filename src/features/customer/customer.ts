import { AfterViewInit, Component, inject, signal, ViewChild } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customer.model';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MatCard, MatCardHeader, MatCardTitle, MatCardContent } from '@angular/material/card';

@Component({
  selector: 'app-customer',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,

    // Material Form
    MatFormFieldModule,
    MatInputModule,

    // Material Buttons & Icons
    MatButtonModule,
    MatIconModule,

    // Material Card
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,

    // Material Loading
    MatProgressSpinnerModule,

    // Material Tooltip
    MatTooltipModule,

    // Material Table
    MatTableModule,

    // Material Pagination
    MatPaginatorModule,
  ],

  templateUrl: './customer.html',
  styleUrl: './customer.css',
})
export class CustomerComponent {
  private readonly fb = inject(FormBuilder);
  private readonly customerService = inject(CustomerService);

  /**
   * Material table paginator
   */
  private paginator?: MatPaginator;

  @ViewChild(MatPaginator)
  set matPaginator(paginator: MatPaginator | undefined) {
    if (paginator) {
      this.paginator = paginator;
      this.dataSource.paginator = paginator;
    }
  }

  /**
   * Customer list
   */
  customers = signal<Customer[]>([]);

  /**
   * Material table data source
   */
  dataSource = new MatTableDataSource<Customer>();

  /**
   * Currently selected customer
   */
  selectedCustomer = signal<Customer | null>(null);

  /**
   * Loading state
   */
  loading = signal(false);

  /**
   * Error message
   */
  errorMessage = signal('');

  /**
   * Success message
   */
  successMessage = signal('');

  /**
   * Form mode
   */
  formType = signal<'new' | 'update'>('new');

  /**
   * Columns displayed in customer table
   */
  displayedColumns = ['customerId', 'name', 'phone', 'status', 'actions'];

  /**
   * Customer form
   */
  customerForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    phone: ['', Validators.required],
    email: [''],
    address: [''],
    pincode: [''],
    gstin: [''],
  });

  constructor() {
    /**
     * Configure table filtering
     *
     * Search fields:
     * - Customer name
     * - Phone number
     * - Customer code
     */
    this.dataSource.filterPredicate = (customer, filter) => {
      const search = filter.trim().toLowerCase();

      return (
        customer.name.toLowerCase().includes(search) ||
        customer.phone.toLowerCase().includes(search) ||
        customer.customerId.toLowerCase().includes(search)
      );
    };

    this.loadCustomers();
  }

  /**
   * Search customers
   */
  filterCustomers(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();

    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  /**
   * Load all customers
   */
  loadCustomers(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.customerService.getCustomers().subscribe({
      next: (response) => {
        this.customers.set(response.data);
        this.dataSource.data = response.data;
        this.loading.set(false);

        if (this.paginator) {
          this.paginator.firstPage();
        }
      },

      error: (error) => {
        this.loading.set(false);

        this.errorMessage.set(error?.error?.message || 'Failed to load customers.');
      },
    });
  }

  /**
   * Create customer
   */
  createCustomer(): void {
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const customerData = this.customerForm.getRawValue();

    this.customerService.createCustomer(customerData).subscribe({
      next: (response) => {
        this.successMessage.set(response.message);

        this.loading.set(false);

        this.resetForm();

        this.loadCustomers();
      },

      error: (error) => {
        this.loading.set(false);

        this.errorMessage.set(error?.error?.message || 'Failed to create customer.');
      },
    });
  }

  /**
   * Select customer for editing
   */
  editCustomer(customer: Customer): void {
    this.formType.set('update');

    this.selectedCustomer.set(customer);

    this.customerForm.patchValue({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
      pincode: customer.pincode || '',
      gstin: customer.gstin || '',
    });
  }

  /**
   * Update customer
   */
  updateCustomer(): void {
    const customer = this.selectedCustomer();

    if (!customer?._id) {
      return;
    }

    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const customerData = this.customerForm.getRawValue();

    this.customerService.updateCustomer(customer._id, customerData).subscribe({
      next: (response) => {
        this.successMessage.set(response.message);

        this.loading.set(false);

        this.resetForm();

        this.loadCustomers();
      },

      error: (error) => {
        this.loading.set(false);

        this.errorMessage.set(error?.error?.message || 'Failed to update customer.');
      },
    });
  }

  /**
   * Deactivate customer
   */
  deactivateCustomer(customer: Customer): void {
    if (!customer._id) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.customerService.deactivateCustomer(customer._id).subscribe({
      next: (response) => {
        this.successMessage.set(response.message);

        this.loading.set(false);

        this.loadCustomers();
      },

      error: (error) => {
        this.loading.set(false);

        this.errorMessage.set(error?.error?.message || 'Failed to deactivate customer.');
      },
    });
  }

  /**
   * Reset form
   */
  resetForm(): void {
    this.customerForm.reset();

    this.selectedCustomer.set(null);

    this.formType.set('new');
  }
}
