// import { Component, signal } from '@angular/core';
// import { ReportSummary } from '../report.model';
// import { MatCardContent, MatCardHeader, MatCard, MatCardTitle } from '@angular/material/card';
// import { DecimalPipe } from '@angular/common';

// @Component({
//   selector: 'app-report-overview',
//   imports: [MatCardContent, MatCardHeader, MatCard, MatCardTitle, DecimalPipe],
//   templateUrl: './report-overview.html',
//   styleUrl: './report-overview.css',
// })
// export class ReportOverview {
//   readonly summary = signal<ReportSummary>({
//     totalSales: 0,
//     transactionCount: 0,
//     averageBill: 0,
//     customerCount: 0,
//   });
// }
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

import { ReportsService, OverviewResponse } from '../../../services/report.service';

type DateFilter = 'today' | 'week' | 'month' | 'custom';

@Component({
  selector: 'app-report-overview',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './report-overview.html',
  styleUrl: './report-overview.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportOverview {
  private readonly reportsService = inject(ReportsService);

  readonly selectedFilter = signal<DateFilter>('today');

  readonly customFromDate = signal<Date | null>(null);
  readonly customToDate = signal<Date | null>(null);

  readonly overview = signal<OverviewResponse | null>(null);

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly showCustomDates = computed(() => this.selectedFilter() === 'custom');

  readonly filterLabel = computed(() => {
    switch (this.selectedFilter()) {
      case 'today':
        return 'Today';

      case 'week':
        return 'This Week';

      case 'month':
        return 'This Month';

      case 'custom':
        return 'Custom Range';
    }
  });

  constructor() {
    this.loadOverview();
  }

  onFilterChange(): void {
    this.errorMessage.set('');

    if (this.selectedFilter() !== 'custom') {
      this.loadOverview();
    }
  }

  applyCustomDateRange(): void {
    const from = this.customFromDate();
    const to = this.customToDate();

    if (!from || !to) {
      this.errorMessage.set('Please select both From and To dates.');
      return;
    }

    if (from > to) {
      this.errorMessage.set('From date cannot be after To date.');
      return;
    }

    this.loadOverview();
  }

  refresh(): void {
    this.loadOverview();
  }

  private loadOverview(): void {
    const dateRange = this.getDateRange();

    if (!dateRange) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.reportsService
      .getOverview(dateRange.from, dateRange.to)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.overview.set(response);
        },

        error: (error) => {
          console.error('Failed to load overview', error);

          this.overview.set(null);

          this.errorMessage.set('Unable to load overview data.');
        },
      });
  }

  private getDateRange(): {
    from: string;
    to: string;
  } | null {
    const today = new Date();

    switch (this.selectedFilter()) {
      case 'today':
        return {
          from: this.formatDate(today),
          to: this.formatDate(today),
        };

      case 'week': {
        const start = new Date(today);

        const day = start.getDay();

        const difference = day === 0 ? 6 : day - 1;

        start.setDate(start.getDate() - difference);

        return {
          from: this.formatDate(start),
          to: this.formatDate(today),
        };
      }

      case 'month': {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);

        return {
          from: this.formatDate(start),
          to: this.formatDate(today),
        };
      }

      case 'custom': {
        const from = this.customFromDate();
        const to = this.customToDate();

        if (!from || !to) {
          return null;
        }

        return {
          from: this.formatDate(from),
          to: this.formatDate(to),
        };
      }
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, '0');

    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
