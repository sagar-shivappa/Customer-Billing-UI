import { Injectable, computed, inject, signal } from '@angular/core';
import { ProductService } from './product.service';
import { OrderSummary, OrderSummaryItem, Item } from '../models/bill.model';
import { HttpClient } from '@angular/common/http';
import { app_config } from '../app/core/config/app.config';

@Injectable({
  providedIn: 'root',
})
export class BillingService {
  private readonly productService = inject(ProductService);
  private readonly http = inject(HttpClient);
  private readonly _orderedItems = signal<Item[]>([]);

  readonly orderedItems = this._orderedItems.asReadonly();

  customerDetails = signal<{ customerId: string; paymentType: string }>({
    customerId: '',
    paymentType: '',
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

  order() {
    const billPayload = this.buildBillPayload(this.orderSummary(), this.customerDetails());

    this.http.post(`${app_config.API_BASE_URL}/api/billing`, billPayload).subscribe({
      next: (data) => {
        console.log(data);
      },
      error: (error) => {
        // Don't modify products signal
        console.error('Failed to add product', error);
      },
    });
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
      customerId: payment.customerId,
    };
  }
}
