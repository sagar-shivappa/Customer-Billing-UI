import { Component } from '@angular/core';
import { ReportOverview } from './report-overview/report-overview';
import { ReportTransactions } from './report-transactions/report-transactions';
import { SalesAnalysis } from './sales-analysis/sales-analysis';
import { ReportProducts } from './report-products/report-products';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-reports-component',
  imports: [ReportOverview, ReportTransactions, SalesAnalysis, ReportProducts, MatTabsModule],
  templateUrl: './reports-component.html',
  styleUrl: './reports-component.css',
})
export class ReportsComponent {}
