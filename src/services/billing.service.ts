import { Injectable, signal } from '@angular/core';
import { BillItem } from '../models/bill.model';

@Injectable({
  providedIn: 'root',
})
export class BillingService {
  private readonly _billItems = signal<BillItem[]>([]);

  readonly billItems = this._billItems.asReadonly();

  addItem(item: BillItem): void {
    this._billItems.update((items) => [...items, item]);
  }
}
