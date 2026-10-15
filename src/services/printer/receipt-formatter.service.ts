import { Injectable, inject } from '@angular/core';

import { Billing, BillingItem } from '../billing.service';
import { OwnerProfileService } from '../owner.service';

import { RECEIPT_LAYOUTS } from './receipt-layout';
import { ReceiptLayout, ReceiptWidth } from './printer.types';

@Injectable({
  providedIn: 'root',
})
export class ReceiptFormatterService {
  private readonly ownerProfileService = inject(OwnerProfileService);

  format(bill: Billing, receiptWidth: ReceiptWidth): string[] {
    const data: string[] = [];

    const owner = this.ownerProfileService.profile();
    const layout = RECEIPT_LAYOUTS[receiptWidth];

    // Reset printer
    data.push('\x1B\x40');

    // =========================
    // HEADER
    // =========================

    data.push('\x1B\x61\x01');

    data.push('\x1B\x45\x01');

    if (owner?.shopName) {
      data.push(`${owner.shopName}\n`);
    }

    data.push('\x1B\x45\x00');

    if (owner?.address) {
      data.push(`${owner.address}\n`);
    }

    if (owner?.pinCode) {
      data.push(`PIN: ${owner.pinCode}\n`);
    }

    if (owner?.gstin) {
      data.push(`GSTIN: ${owner.gstin}\n`);
    }

    data.push(this.separator(layout));

    // =========================
    // BILL DETAILS
    // =========================

    data.push('\x1B\x61\x00');

    data.push(`Bill No : ${bill.billNumber}\n`);
    data.push(`Date    : ${this.formatDate(bill.saleDate)}\n`);
    data.push(`Customer: ${bill.customerName || 'Walk-In'}\n`);

    data.push(this.separator(layout));

    // =========================
    // ITEMS
    // =========================

    data.push(this.formatItemHeader(layout));

    data.push(this.separator(layout));

    for (const item of bill.items) {
      data.push(...this.formatItem(item, layout));
    }

    data.push(this.separator(layout));

    // =========================
    // TOTAL
    // =========================

    data.push('\x1B\x61\x02');
    data.push('\x1B\x45\x01');

    data.push(`TOTAL: Rs.${bill.grandTotal.toFixed(2)}\n`);

    data.push('\x1B\x45\x00');

    // =========================
    // PAYMENT
    // =========================

    data.push(`Payment: ${bill.paymentType}\n`);

    // =========================
    // FOOTER
    // =========================

    data.push('\n');

    data.push('\x1B\x61\x01');

    data.push('Thank You!\n');
    data.push('Visit Again\n');

    // Feed paper
    data.push('\n\n\n');

    return data;
  }

  private formatItemHeader(layout: ReceiptLayout): string {
    return (
      this.padRight('Item', layout.itemNameWidth) +
      this.padLeft('Qty', layout.quantityWidth) +
      this.padLeft('Amount', layout.amountWidth) +
      '\n'
    );
  }

  private formatItem(item: BillingItem, layout: ReceiptLayout): string[] {
    const name = this.truncate(item.productName, layout.itemNameWidth);

    const quantity = this.padLeft(String(item.quantity), layout.quantityWidth);

    const amount = this.padLeft(item.totalPrice.toFixed(2), layout.amountWidth);

    return [`${this.padRight(name, layout.itemNameWidth)}${quantity}${amount}\n`];
  }

  private separator(layout: ReceiptLayout): string {
    return `${'-'.repeat(layout.columns)}\n`;
  }

  private padRight(value: string, length: number): string {
    return value.padEnd(length, ' ');
  }

  private padLeft(value: string, length: number): string {
    return value.padStart(length, ' ');
  }

  private truncate(value: string, length: number): string {
    if (value.length <= length) {
      return value;
    }

    return `${value.substring(0, length - 1)}.`;
  }

  private formatDate(date: string): string {
    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return date;
    }

    const day = String(value.getDate()).padStart(2, '0');
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const year = value.getFullYear();

    let hours = value.getHours();
    const minutes = String(value.getMinutes()).padStart(2, '0');

    const period = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12 || 12;

    return `${day}-${month}-${year} ${hours}:${minutes} ${period}`;
  }
}
