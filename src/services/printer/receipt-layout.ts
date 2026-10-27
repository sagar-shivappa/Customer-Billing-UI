import { ReceiptLayout, ReceiptWidth } from './printer.types';

export const RECEIPT_LAYOUTS: Record<ReceiptWidth, ReceiptLayout> = {
  '58mm': {
    columns: 32,
    itemNameWidth: 13,
    quantityWidth: 4,
    priceWidth: 9,
    amountWidth: 6,
  },

  '80mm': {
    columns: 48,
    itemNameWidth: 23,
    quantityWidth: 5,
    priceWidth: 10,
    amountWidth: 10,
  },

  '4inch': {
    columns: 64,
    itemNameWidth: 34,
    quantityWidth: 7,
    priceWidth: 11,
    amountWidth: 12,
  },
};
