import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { app_config } from '../app/core/config/app.config';

export interface OverviewResponse {
  totalSales: number;
  transactionCount: number;
  averageBill: number;
  customerCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private readonly http = inject(HttpClient);

  getOverview(from: string, to: string): Observable<OverviewResponse> {
    const params = new HttpParams().set('from', from).set('to', to);

    return this.http.get<OverviewResponse>(`${app_config.API_BASE_URL}/api/reports/overview`, {
      params,
    });
  }
}
