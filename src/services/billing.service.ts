import { Injectable, computed, inject, signal } from '@angular/core';
import { ProductService } from './product.service';
import { OrderSummary, OrderSummaryItem, Item } from '../models/bill.model';
import { HttpClient } from '@angular/common/http';
import { app_config } from '../app/core/config/app.config';
import { Observable } from 'rxjs';
import { CustomerService } from './customer.service';

export type PaymentType = 'Cash' | 'UPI' | 'Credit';

export interface BillingItem {
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Billing {
  _id?: string;
  billNumber: string;
  customerName: string;
  items: BillingItem[];
  grandTotal: number;
  paymentType: PaymentType;
  saleDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BillingResponse {
  success: boolean;
  message: string;
  data: Billing;
}

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

    const productMap = new Map(products.map((p) => [p.productCode, p]));

    for (const item of items) {
      const product = productMap.get(item.productCode);

      if (!product) {
        continue;
      }

      const itemTotal = product.sellingPrice * (item.quantity ?? 1);

      totalAmount += itemTotal;

      summaryItems.push({
        productCode: product.productCode,
        productName: product.productName,
        quantity: item.quantity ?? 1,
        unitPrice: product.sellingPrice,
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

  //Blocking in function, as we dont want user's to edit the product price while generating bill
  // updateUnitPrice(productCode: string, unitPrice: number): void {
  //   this._orderedItems.update((items) =>
  //     items.map((item) =>
  //       item.productCode === productCode
  //         ? {
  //             ...item,
  //             unitPrice: Math.max(0, unitPrice),
  //           }
  //         : item,
  //     ),
  //   );
  //   console.log(this._orderedItems());
  // }

  clearOrder(): void {
    this._orderedItems.set([]);
  }

  removeItem(productCode: string) {
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
      }[];
    },
    payment: {
      customerId: string;
      paymentType: string;
    },
  ) {
    return {
      items: order.items.map((item) => ({
        productCode: item.productCode,
        quantity: item.quantity,
      })),
      paymentType: payment.paymentType,
      customerName: this.customerService.customer()?.name,
    };
  }

  updatePaymentType(billId: string, paymentType: 'Cash' | 'UPI'): Observable<Billing> {
    return this.http.patch<Billing>(`${app_config.API_BASE_URL}/api/billing/${billId}/payment`, {
      paymentType,
    });
  }
}
