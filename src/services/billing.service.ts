import { Injectable, computed, inject, signal } from '@angular/core';

import { ProductService } from './product.service';
import { OrderSummary, OrderSummaryItem, Item } from '../models/bill.model';

@Injectable({
  providedIn: 'root',
})
export class BillingService {
  private readonly productService = inject(ProductService);

  private readonly _orderedItems = signal<Item[]>([]);

  readonly orderedItems = this._orderedItems.asReadonly();

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
              quantity: existing.quantity + item.quantity,
            }
          : existing,
      );
    });
  }

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

      const itemTotal = product.price * item.quantity;

      totalAmount += itemTotal;

      summaryItems.push({
        productCode: product.productCode,
        productName: product.productName,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: itemTotal,
      });
    }

    return {
      items: summaryItems,
      totalAmount,
    };
  });
}
