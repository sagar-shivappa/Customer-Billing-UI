export interface Transaction {
  billNumber: string;
  customerId?: string;
  customerName?: string;

  items: TransactionItem[];

  grandTotal: number;
  paymentType: string;

  saleDate: string;
}

export interface TransactionItem {
  productCode: string;
  productName: string;

  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
