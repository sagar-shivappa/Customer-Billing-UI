import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { app_config } from '../app/core/config/app.config';

export interface SalesTrend {
  date: string;
  sales: number;
}

export interface OverviewResponse {
  totalSales: number;
  transactionCount: number;
  averageBill: number;
  customerCount: number;
  salesTrend: SalesTrend[];
  paymentBreakdown: PaymentBreakdown[];
}

export interface PaymentBreakdown {
  paymentType: string;
  amount: number;
  transactionCount: number;
}

export interface TransactionItem {
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Transaction {
  _id?: string;
  billNumber: string;
  customerId?: string;
  customerName?: string;
  items: TransactionItem[];
  grandTotal: number;
  paymentType: string;
  saleDate: string;
}

export interface TransactionSummary {
  transactionCount: number;
  totalSales: number;
  averageBill: number;
}

export interface TransactionPagination {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  pagination: TransactionPagination;
  summary: TransactionSummary;
}

export interface TransactionFilters {
  from?: string;
  to?: string;
  paymentType?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProductsReportSummary {
  productCount: number;
  totalQuantitySold: number;
  totalRevenue: number;
  estimatedProfit: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export type ProductStockStatus = 'In stock' | 'Low stock' | 'Out of stock';

export interface ProductReportItem {
  _id: string;
  productName: string;
  productCode: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  isActive: boolean;
  totalQuantitySold: number;
  totalRevenue: number;
  estimatedProfit: number;
  stockStatus: ProductStockStatus;
}

export interface ProductsReportData {
  summary: ProductsReportSummary;
  products: ProductReportItem[];
}

export interface ProductsReportResponse {
  success: boolean;
  message: string;
  data: ProductsReportData;
}

export interface ProductsReportFilters {
  from?: string;
  to?: string;
  category?: string;
  search?: string;
  sortBy?: 'revenue' | 'quantitySold' | 'stock' | 'estimatedProfit' | 'productName';
  sortOrder?: 'asc' | 'desc';
}

// =========================
// Reports Service
// =========================

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private readonly http = inject(HttpClient);

  // =========================
  // Overview
  // =========================

  getOverview(from: string, to: string): Observable<OverviewResponse> {
    const params = new HttpParams().set('from', from).set('to', to);

    return this.http.get<OverviewResponse>(`${app_config.API_BASE_URL}/api/reports/overview`, {
      params,
    });
  }

  // =========================
  // Transactions
  // =========================

  getTransactions(filters: TransactionFilters): Observable<TransactionsResponse> {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http.get<TransactionsResponse>(
      `${app_config.API_BASE_URL}/api/reports/transactions`,
      { params },
    );
  }

  // =========================
  // Products Report
  // =========================

  getProductsReport(filters: ProductsReportFilters = {}): Observable<ProductsReportResponse> {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http.get<ProductsReportResponse>(
      `${app_config.API_BASE_URL}/api/reports/products`,
      { params },
    );
  }
}
