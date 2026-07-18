export interface OrderSummaryItem {
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Item {
  productCode: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderSummary {
  items: OrderSummaryItem[];
  totalAmount: number;
}
