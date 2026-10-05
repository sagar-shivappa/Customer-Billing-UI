import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer, CustomerResponse, CustomersResponse } from '../models/customer.model';
import { app_config } from '../app/core/config/app.config';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private http = inject(HttpClient);

  private readonly apiUrl = app_config.API_BASE_URL;

  /**
   * Get all customers
   */
  getCustomers(): Observable<CustomersResponse> {
    return this.http.get<CustomersResponse>(`${this.apiUrl}/api/customers`);
  }

  /**
   * Get customer by phone
   */
  getCustomerByPhone(phone: string): Observable<CustomerResponse> {
    return this.http.get<CustomerResponse>(`${this.apiUrl}/api/customers/lookup`, {
      params: {
        phone,
      },
    });
  }

  /**
   * Create customer
   */
  createCustomer(
    customer: Omit<Customer, 'customerId' | '_id' | 'isActive' | 'createdAt' | 'updatedAt'>,
  ): Observable<CustomerResponse> {
    return this.http.post<CustomerResponse>(`${this.apiUrl}/api/customers`, customer);
  }

  /**
   * Update customer
   */
  updateCustomer(id: string, customer: Partial<Customer>): Observable<CustomerResponse> {
    return this.http.put<CustomerResponse>(`${this.apiUrl}/api/customers/${id}`, customer);
  }

  /**
   * Deactivate customer
   */
  deactivateCustomer(id: string): Observable<CustomerResponse> {
    return this.http.delete<CustomerResponse>(`${this.apiUrl}/${id}`);
  }
}
