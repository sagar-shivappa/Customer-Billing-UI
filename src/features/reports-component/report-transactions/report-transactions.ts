import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ReportsService, TransactionFilters } from '../../../services/report.service';
import { finalize } from 'rxjs';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog';
import { Billing, BillingService } from '../../../services/billing.service';
import { PrinterService } from '../../../services/printer/printer.service';

type DateFilter = 'today' | 'week' | 'month' | 'custom';

@Component({
  selector: 'app-report-transactions',
  imports: [
    CommonModule,
    FormsModule,

    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,

    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,

    MatTableModule,
    MatPaginatorModule,

    MatDialogModule,
  ],

  templateUrl: './report-transactions.html',
  styleUrl: './report-transactions.css',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportTransactions {
  // Inject your report service here once the endpoint is ready.
  private readonly billingService = inject(BillingService);
  private readonly printerService = inject(PrinterService);
  private readonly dialog = inject(MatDialog);
  private readonly reportsService = inject(ReportsService);

  readonly page = signal(1);
  readonly pageSize = signal(10);

  readonly totalRecords = signal(0);
  readonly totalPages = signal(0);

  readonly transactions = signal<Billing[]>([]);

  readonly loading = signal(false);

  readonly errorMessage = signal('');

  readonly searchText = signal('');

  readonly selectedFilter = signal<DateFilter>('today');

  readonly selectedPaymentType = signal<string>('all');

  readonly fromDate = signal<string>('');

  readonly toDate = signal<string>('');

  readonly selectedTransaction = signal<Billing | null>(null);
  readonly summary = signal({
    transactionCount: 0,
    totalSales: 0,
    averageBill: 0,
  });
  readonly pendingPaymentChanges = signal<Record<string, 'Cash' | 'UPI'>>({});

  // =========================
  // Table
  // =========================

  readonly displayedColumns = [
    'billNumber',
    'saleDate',
    'customer',
    'items',
    'grandTotal',
    'paymentType',
    'actions',
  ];

  itemDisplayedColumns = ['product', 'quantity', 'price', 'total'];

  // =========================
  // Computed
  // =========================

  readonly filteredTransactions = computed(() => {
    const transactions = this.transactions();

    const search = this.searchText().trim().toLowerCase();

    const paymentType = this.selectedPaymentType();

    return transactions.filter((transaction) => {
      const matchesSearch =
        !search ||
        transaction.billNumber.toLowerCase().includes(search) ||
        transaction.customerId?.toLowerCase().includes(search) ||
        transaction.customerName?.toLowerCase().includes(search);

      const matchesPayment = paymentType === 'all' || transaction.paymentType === paymentType;

      return matchesSearch && matchesPayment;
    });
  });

  constructor() {
    this.loadTransactions();
  }

  // =========================
  // Load
  // =========================

  loadTransactions(): void {
    const filters: TransactionFilters = {
      ...this.getDateRange(),
      paymentType: this.selectedPaymentType() === 'all' ? undefined : this.selectedPaymentType(),
      search: this.searchText().trim() || undefined,
      page: this.page(),
      limit: this.pageSize(),
    };

    this.loading.set(true);
    this.errorMessage.set('');

    this.reportsService
      .getTransactions(filters)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.transactions.set(response.transactions);
          this.totalRecords.set(response.pagination.totalRecords);
          this.totalPages.set(response.pagination.totalPages);
          this.summary.set(response.summary);
        },
        error: (error) => {
          console.error('Failed to load transactions', error);
          this.transactions.set([]);
          this.totalRecords.set(0);
          this.totalPages.set(0);
          this.errorMessage.set('Unable to load transactions.');
        },
      });
  }

  private getDateRange(): Pick<TransactionFilters, 'from' | 'to'> {
    const today = new Date();

    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    };

    switch (this.selectedFilter()) {
      case 'today':
        return {
          from: formatDate(today),
          to: formatDate(today),
        };

      case 'week': {
        const start = new Date(today);
        const difference = start.getDay() === 0 ? 6 : start.getDay() - 1;
        start.setDate(start.getDate() - difference);

        return {
          from: formatDate(start),
          to: formatDate(today),
        };
      }

      case 'month':
        return {
          from: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)),
          to: formatDate(today),
        };

      case 'custom':
        return {
          from: this.fromDate() || undefined,
          to: this.toDate() || undefined,
        };
    }
  }

  // =========================
  // Filters
  // =========================

  onDateFilterChange(): void {
    if (this.selectedFilter() !== 'custom') {
      this.page.set(1);
      this.loadTransactions();
    }
  }

  applyFilters(): void {
    if (this.selectedFilter() === 'custom' && (!this.fromDate() || !this.toDate())) {
      this.errorMessage.set('Please select both dates.');
      return;
    }

    if (this.selectedFilter() === 'custom' && this.fromDate() > this.toDate()) {
      this.errorMessage.set('From date cannot be after To date.');
      return;
    }

    this.page.set(1);
    this.loadTransactions();
  }

  clearFilters(): void {
    this.searchText.set('');
    this.selectedFilter.set('today');
    this.selectedPaymentType.set('all');
    this.fromDate.set('');
    this.toDate.set('');
    this.page.set(1);
    this.loadTransactions();
  }

  // =========================
  // Transaction
  // =========================

  viewTransaction(transaction: Billing): void {
    this.selectedTransaction.set(transaction);
  }

  closeTransaction(): void {
    this.selectedTransaction.set(null);
  }

  printTransaction(transaction: Billing): void {
    console.log('Print transaction:', transaction);

    // Printing can be implemented next.
    this.printerService.printBill(transaction).catch((error) => {
      console.error('Failed to print bill:', error);
    });
  }

  // =========================
  // Helpers
  // =========================

  getItemCount(transaction: Billing): number {
    return transaction.items.reduce((count, item) => count + item.quantity, 0);
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.page.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadTransactions();
  }

  onPaymentTypeChange(transaction: Billing, paymentType: 'Cash' | 'UPI' | 'Credit'): void {
    if (transaction.paymentType !== 'Credit') {
      return;
    }

    // User selected Credit again → remove any pending change
    if (paymentType === 'Credit') {
      this.pendingPaymentChanges.update((changes) => {
        const updated = { ...changes };
        delete updated[transaction._id];
        return updated;
      });

      return;
    }

    // Cash or UPI selected
    this.pendingPaymentChanges.update((changes) => ({
      ...changes,
      [transaction._id]: paymentType,
    }));
  }

  getPendingPaymentType(transaction: Billing): 'Cash' | 'UPI' | 'Credit' {
    return this.pendingPaymentChanges()[transaction._id] ?? transaction.paymentType;
  }

  updateTransaction(transaction: Billing): void {
    if (transaction.paymentType !== 'Credit') {
      return;
    }

    const paymentType = this.pendingPaymentChanges()[transaction._id];

    if (!paymentType) {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Update Payment?',
        message: `Mark bill ${transaction.billNumber} as paid via ${paymentType}?`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.billingService
        .updatePaymentType(transaction._id, paymentType)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: () => {
            // Update the transaction locally
            this.transactions.update((transactions) =>
              transactions.map((item) =>
                item._id === transaction._id
                  ? {
                      ...item,
                      paymentType,
                    }
                  : item,
              ),
            );

            // Remove pending change
            this.pendingPaymentChanges.update((changes) => {
              const updated = { ...changes };
              delete updated[transaction._id];
              return updated;
            });

            // Update currently opened transaction, if any
            if (this.selectedTransaction()?._id === transaction._id) {
              this.selectedTransaction.update((item) =>
                item
                  ? {
                      ...item,
                      paymentType,
                    }
                  : null,
              );
            }
          },

          error: (error) => {
            console.error('Failed to update payment type', error);
            this.errorMessage.set('Unable to update payment type.');
          },
        });
    });
  }
}
