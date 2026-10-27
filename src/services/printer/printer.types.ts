export type ReceiptWidth = '58mm' | '80mm' | '4inch';

export interface ReceiptLayout {
  columns: number;
  itemNameWidth: number;
  quantityWidth: number;
  priceWidth: number;
  amountWidth: number;
}

export interface PrinterProfile {
  id: string;
  name: string;
  receiptWidth: ReceiptWidth;
  description?: string;
}
