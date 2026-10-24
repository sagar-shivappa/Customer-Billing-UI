import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ProductService } from './product.service';
import { CustomerService } from './customer.service';

import {
  OrderSummary,
  OrderSummaryItem,
  Item,
  PaymentType,
  Billing,
  BillingResponse,
} from '../models/bill.model';

import { app_config } from '../app/core/config/app.config';

@Injectable({
  providedIn: 'root',
})
export class BillingService {
  private readonly productService = inject(ProductService);
  private readonly customerService = inject(CustomerService);
  private readonly http = inject(HttpClient);

  private readonly _orderedItems = signal<Item[]>([]);

  readonly orderedItems = this._orderedItems.asReadonly();

  customerDetails = signal<{
    customerId: string;
    paymentType: PaymentType;
  }>({
    customerId: '',
    paymentType: 'Cash',
  });

  readonly orderSummary = computed<OrderSummary>(() => {
    const products = this.productService.products();
    const items = this.orderedItems();

    const summaryItems: OrderSummaryItem[] = [];

    let totalAmount = 0;

    const productMap = new Map(products.map((product) => [product.productCode, product]));

    for (const item of items) {
      const product = productMap.get(item.productCode);

      if (!product) {
        continue;
      }

      const quantity = item.quantity ?? 1;
      const unitPrice = item.unitPrice ?? product.sellingPrice;
      const itemTotal = unitPrice * quantity;

      totalAmount += itemTotal;

      summaryItems.push({
        productCode: product.productCode,
        productName: product.productName,
        quantity,
        unitPrice,
        totalPrice: itemTotal,
      });
    }

    return {
      items: summaryItems,
      totalAmount,
    };
  });

  addItem(item: Item): void {
    this._orderedItems.update((items) => {
      const existingIndex = items.findIndex((i) => i.productCode === item.productCode);

      if (existingIndex === -1) {
        return [...items, item];
      }

      return items.map((existing, index) =>
        index === existingIndex
          ? {
              ...existing,
              quantity: (existing.quantity ?? 1) + (item.quantity ?? 1),
            }
          : existing,
      );
    });
  }

  updateQuantity(productCode: string, quantity: number): void {
    this._orderedItems.update((items) =>
      items.map((item) =>
        item.productCode === productCode
          ? {
              ...item,
              quantity: Math.max(1, quantity),
            }
          : item,
      ),
    );
  }

  updateUnitPrice(productCode: string, unitPrice: number): void {
    this._orderedItems.update((items) =>
      items.map((item) =>
        item.productCode === productCode
          ? {
              ...item,
              unitPrice: Math.max(0, unitPrice),
            }
          : item,
      ),
    );
  }

  clearOrder(): void {
    this._orderedItems.set([]);
  }

  removeItem(productCode: string): void {
    this._orderedItems.update((items) => items.filter((item) => item.productCode !== productCode));
  }

  order(): Observable<BillingResponse> {
    const billPayload = this.buildBillPayload(this.orderSummary(), this.customerDetails());

    return this.http.post<BillingResponse>(`${app_config.API_BASE_URL}/api/billing`, billPayload);
  }

  buildBillPayload(
    order: {
      items: {
        productCode: string;
        quantity: number;
        unitPrice: number;
      }[];
    },
    payment: {
      customerId: string;
      paymentType: PaymentType;
    },
  ) {
    return {
      items: order.items.map((item) => ({
        productCode: item.productCode,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      paymentType: payment.paymentType,
      customerId: payment.customerId,
      customerName: this.customerService.customer()?.name,
    };
  }

  updatePaymentType(billId: string, paymentType: 'Cash' | 'UPI'): Observable<Billing> {
    return this.http.patch<Billing>(`${app_config.API_BASE_URL}/api/billing/${billId}/payment`, {
      paymentType,
    });
  }
}
