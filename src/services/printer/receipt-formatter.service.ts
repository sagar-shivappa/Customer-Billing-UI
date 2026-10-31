import { Injectable, inject } from '@angular/core';

import { Billing, BillingItem } from '../../models/bill.model';
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

    const is80mm = receiptWidth === '80mm';

    // =========================
    // BILL TOTALS
    // =========================

    const subtotal = bill.subtotal;
    const gstPercentage = bill.gstPercentage;
    const sgstAmount = bill.sgstAmount;
    const cgstAmount = bill.cgstAmount;
    const roundOff = bill.roundOff;
    const grandTotal = bill.grandTotal;

    // =========================
    // RESET PRINTER
    // =========================

    data.push('\x1B\x40');

    // =========================
    // CUSTOMER RECEIPT
    // =========================

    // HEADER
    data.push('\x1B\x61\x01');

    if (owner?.shopName) {
      if (is80mm) {
        // 80mm: larger + bold company name
        data.push('\x1B\x45\x01'); // Bold ON
        data.push('\x1D\x21\x11'); // Double width + double height
        data.push(`${owner.shopName}\n`);
        data.push('\x1D\x21\x00'); // Normal size
        data.push('\x1B\x45\x00'); // Bold OFF
      } else {
        // 58mm: existing bold company name
        data.push('\x1B\x45\x01');
        data.push(`${owner.shopName}\n`);
        data.push('\x1B\x45\x00');
      }
    }

    if (owner?.address) {
      data.push(`${owner.address}\n`);
    }

    if (owner?.pinCode) {
      data.push(`${owner.pinCode}\n`);
    }

    if (owner?.gstin) {
      data.push(`GSTIN: ${owner.gstin}\n`);
    }

    data.push(this.separator(layout));

    // BILL DETAILS
    data.push(...this.formatBillDetails(bill, layout, is80mm));

    // TOTALS
    data.push('\x1B\x61\x00');

    if (owner.includeGst) {
      data.push(this.formatTotalRow('Subtotal', subtotal, layout));
    }

    if (gstPercentage > 0) {
      const halfGstPercentage = gstPercentage / 2;

      data.push(this.formatTotalRow(`SGST @ ${halfGstPercentage}%`, sgstAmount, layout));

      data.push(this.formatTotalRow(`CGST @ ${halfGstPercentage}%`, cgstAmount, layout));
    }

    if (Math.abs(roundOff) >= 0.01) {
      data.push(this.formatTotalRow('Round Off', roundOff, layout));
    }

    data.push(this.separator(layout));

    // GRAND TOTAL
    if (is80mm) {
      data.push('\x1B\x61\x01');
      data.push('\x1B\x45\x01');

      data.push(`GRAND TOTAL: Rs.${grandTotal}\n`);

      data.push('\x1D\x21\x00');
      data.push('\x1B\x45\x00');
    } else {
      data.push('\x1B\x61\x02');
      data.push('\x1B\x45\x01');

      data.push(`GRAND TOTAL: Rs.${grandTotal}\n`);

      data.push('\x1B\x45\x00');
    }

    data.push(this.separator(layout));

    // FOOTER
    data.push('\x1B\x61\x01');

    data.push('Thank You, Visit Again\n');
    data.push('\n\n\n');

    // CUT CUSTOMER RECEIPT
    data.push('\x1D\x56\x00');

    // =========================
    // ORDER COPY
    // =========================

    if (owner?.printOrderCopy) {
      data.push('\x1B\x40');

      // CENTER
      data.push('\x1B\x61\x01');

      data.push('ORDER COPY\n');

      data.push(this.separator(layout));

      // ORDER DETAILS
      data.push(...this.formatBillDetails(bill, layout, is80mm));

      // CUT ORDER COPY
      data.push('\n\n\n');
      data.push('\x1D\x56\x00');
    }

    return data;
  }

  private formatBillDetails(bill: Billing, layout: ReceiptLayout, is80mm: boolean): string[] {
    const data: string[] = [];

    // BILL DETAILS
    data.push('\x1B\x61\x00');

    data.push('\x1B\x45\x01'); // Bold ON
    data.push(`BILL NO: ${bill.billNumber}\n`);
    data.push('\x1B\x45\x00'); // Bold OFF

    data.push(`Date    : ${this.formatDate(bill.saleDate)}\n`);

    if (bill.customerName) {
      data.push(`Customer: ${bill.customerName}\n`);
    }

    data.push(this.separator(layout));

    // ITEMS
    if (is80mm) {
      data.push('\x1B\x45\x01');
    }

    data.push(this.formatItemHeader(layout));

    if (is80mm) {
      data.push('\x1B\x45\x00');
    }

    data.push(this.separator(layout));

    for (const item of bill.items) {
      data.push(...this.formatItem(item, layout));
    }

    data.push(this.separator(layout));

    return data;
  }

  private formatTotalRow(label: string, amount: number, layout: ReceiptLayout): string {
    const sign = amount < 0 ? '-' : '';

    const amountText = `Rs.${sign}${this.formatAmount(Math.abs(amount))}`;

    const labelWidth = layout.columns - amountText.length;

    return this.padRight(this.truncate(label, labelWidth), labelWidth) + amountText + '\n';
  }

  // =========================
  // ITEM HEADER
  // =========================

  private formatItemHeader(layout: ReceiptLayout): string {
    return (
      this.padRight('Item', layout.itemNameWidth) +
      this.center('Qty', layout.quantityWidth) +
      this.center('Price', layout.priceWidth) +
      this.center('Amount', layout.amountWidth) +
      '\n'
    );
  }

  // =========================
  // ITEM ROW
  // =========================

  private formatItem(item: BillingItem, layout: ReceiptLayout): string[] {
    const name = this.truncate(item.productName, layout.itemNameWidth);

    const quantity = this.center(String(item.quantity), layout.quantityWidth);

    const price = this.center(this.formatAmount(item.unitPrice), layout.priceWidth);

    const amount = this.center(this.formatAmount(item.totalPrice), layout.amountWidth);

    return [
      '\x1B\x45\x01', // Bold ON
      this.padRight(name, layout.itemNameWidth),
      '\x1B\x45\x00', // Bold OFF
      `${quantity}${price}${amount}\n`,
    ];
  }

  // =========================
  // NUMBER FORMATTING
  // =========================

  private formatAmount(value: number): string {
    if (Number.isInteger(value)) {
      return String(value);
    }

    return value.toFixed(2);
  }

  // =========================
  // CENTER ALIGNMENT
  // =========================

  private center(value: string, width: number): string {
    if (value.length >= width) {
      return this.truncate(value, width);
    }

    const totalPadding = width - value.length;

    const leftPadding = Math.floor(totalPadding / 2);
    const rightPadding = totalPadding - leftPadding;

    return ' '.repeat(leftPadding) + value + ' '.repeat(rightPadding);
  }

  // =========================
  // RECEIPT HELPERS
  // =========================

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

  // =========================
  // DATE FORMATTING
  // =========================

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
