export interface OrderSummaryItem {
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Item {
  productCode: string;
  quantity?: number;
  unitPrice?: number;
}

export interface OrderSummary {
  items: OrderSummaryItem[];
  totalAmount: number;
}

export type PaymentType = 'Cash' | 'UPI' | 'Credit';

export interface BillingItem {
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Billing {
  _id: string;

  billNumber: string;
  saleDate: string;

  items: BillingItem[];

  customerId?: string;
  customerName?: string;

  paymentType: PaymentType;
  paymentClearedAt?: string;
  subtotal: number;

  gstPercentage: number;
  sgstAmount: number;
  cgstAmount: number;

  roundOff: number;

  grandTotal: number;
}

export interface BillingResponse {
  success: boolean;
  message: string;
  data: Billing;
}
