import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';

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

import {
  Chart,
  ChartConfiguration,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  DoughnutController,
} from 'chart.js';

import { BaseChartDirective } from 'ng2-charts';

import {
  ReportsService,
  OverviewResponse,
  SalesTrend,
  PaymentBreakdown,
} from '../../../services/report.service';

type DateFilter = 'today' | 'week' | 'month' | 'custom';

Chart.register(
  // Line chart
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,

  // Doughnut chart
  DoughnutController,
  ArcElement,

  // Shared
  Tooltip,
  Legend,
  Filler,
);

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
    BaseChartDirective,
  ],
  templateUrl: './report-overview.html',
  styleUrl: './report-overview.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportOverview implements OnInit {
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

  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Sales',
        data: [],
        borderColor: '#3f51b5',
        backgroundColor: 'rgba(63, 81, 181, 0.15)',
        pointBackgroundColor: '#3f51b5',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 7,
        tension: 0.35,
        fill: true,
      },
    ],
  };

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y ?? 0;
            return `Sales: ₹${value.toLocaleString('en-IN')}`;
          },
        },
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#666',
        },
      },

      y: {
        beginAtZero: true,

        grid: {
          color: 'rgba(0, 0, 0, 0.08)',
        },

        ticks: {
          color: '#666',
          callback: (value) => `₹${Number(value).toLocaleString('en-IN')}`,
        },
      },
    },
  };

  paymentChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: ['#4CAF50', '#3F51B5', '#FF9800', '#E91E63', '#9C27B0'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  // Keep all your existing properties and methods.

  ngOnInit(): void {
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

  loadOverview(): void {
    const dateRange = this.getDateRange();

    if (!dateRange) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.reportsService
      .getOverview(dateRange.from, dateRange.to)
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          this.overview.set(response);

          this.updateSalesChart(response.salesTrend ?? []);
          this.updatePaymentChart(response.paymentBreakdown ?? []);
        },

        error: (error) => {
          console.error('Failed to load overview:', error);

          this.overview.set(null);
          this.updateSalesChart([]);

          this.errorMessage.set('Failed to load report data. Please try again.');
        },
      });
  }

  private updateSalesChart(trend: SalesTrend[]): void {
    this.lineChartData = {
      labels: trend.map((item) => this.formatChartDate(item.date)),
      datasets: [
        {
          label: 'Sales',
          data: trend.map((item) => item.sales),

          borderColor: '#3f51b5',
          backgroundColor: 'rgba(63, 81, 181, 0.15)',

          pointBackgroundColor: '#3f51b5',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,

          pointRadius: 4,
          pointHoverRadius: 7,

          tension: 0.35,
          fill: true,
        },
      ],
    };
  }

  private updatePaymentChart(breakdown: PaymentBreakdown[]): void {
    this.paymentChartData = {
      labels: breakdown.map((item) => item.paymentType),

      datasets: [
        {
          data: breakdown.map((item) => item.amount),

          backgroundColor: ['#4CAF50', '#3F51B5', '#FF9800', '#E91E63', '#9C27B0'],

          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    };
  }

  private formatChartDate(date: string): string {
    const [year, month, day] = date.split('-').map(Number);

    const value = new Date(year, month - 1, day);

    return value.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
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
