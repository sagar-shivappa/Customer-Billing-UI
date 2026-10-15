import { ReceiptLayout, ReceiptWidth } from './printer.types';

export const RECEIPT_LAYOUTS: Record<ReceiptWidth, ReceiptLayout> = {
  '58mm': {
    columns: 32,
    itemNameWidth: 18,
    quantityWidth: 4,
    amountWidth: 10,
  },

  '80mm': {
    columns: 48,
    itemNameWidth: 28,
    quantityWidth: 6,
    amountWidth: 14,
  },

  '4inch': {
    columns: 64,
    itemNameWidth: 40,
    quantityWidth: 8,
    amountWidth: 16,
  },
};
