import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

import {
  ReportsService,
  ProductReportItem,
  ProductsReportSummary,
} from '../../../services/report.service';

@Component({
  selector: 'app-report-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
  ],
  templateUrl: './report-products.html',
  styleUrl: './report-products.css',
})
export class ReportProducts implements OnInit {
  private readonly reportsService = inject(ReportsService);
  private readonly cdr = inject(ChangeDetectorRef);
  products: ProductReportItem[] = [];
  summary: ProductsReportSummary | null = null;
  categories: string[] = [];

  fromDate: Date | null = null;
  toDate: Date | null = null;
  selectedCategory = '';
  searchText = '';
  sortBy: 'revenue' | 'quantitySold' | 'stock' | 'estimatedProfit' | 'productName' = 'revenue';
  sortOrder: 'asc' | 'desc' = 'desc';

  errorMessage = '';

  readonly displayedColumns = [
    'product',
    'category',
    'quantitySold',
    'revenue',
    'estimatedProfit',
    'stock',
    'status',
    'active',
  ];

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(): void {
    this.errorMessage = '';

    this.reportsService
      .getProductsReport({
        from: this.formatDate(this.fromDate),
        to: this.formatDate(this.toDate),
        category: this.selectedCategory,
        search: this.searchText.trim(),
        sortBy: this.sortBy,
        sortOrder: this.sortOrder,
      })
      .subscribe({
        next: (response) => {
          this.products = response.data.products;
          this.summary = response.data.summary;

          // Keep the available categories even after applying filters.
          if (this.categories.length === 0) {
            this.categories = [
              ...new Set(this.products.map((product) => product.category).filter(Boolean)),
            ].sort((a, b) => a.localeCompare(b));
          }
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.errorMessage =
            error.error?.message ?? 'Unable to load the products report. Please try again.';
        },
      });
  }

  applyFilters(): void {
    if (this.fromDate && this.toDate && this.fromDate > this.toDate) {
      this.errorMessage = 'From date cannot be after To date.';
      return;
    }

    this.loadReport();
  }

  resetFilters(): void {
    this.fromDate = null;
    this.toDate = null;
    this.selectedCategory = '';
    this.searchText = '';
    this.sortBy = 'revenue';
    this.sortOrder = 'desc';

    this.loadReport();
  }

  private formatDate(date: Date | null): string | undefined {
    if (!date) return undefined;

    // Format in local time to avoid shifting the selected day.
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
