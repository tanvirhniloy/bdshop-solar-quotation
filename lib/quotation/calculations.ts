import { numberToWords } from './number-to-words';
import type { QuotationItem } from '@/types/quotation';

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateItemTotal(quantity: number, unitPrice: number) {
  return roundMoney(quantity * unitPrice);
}

export function calculateTotals(items: Pick<QuotationItem, 'quantity' | 'unit_price'>[], discount = 0, tax = 0) {
  const subtotal = roundMoney(items.reduce((sum, item) => sum + calculateItemTotal(item.quantity, item.unit_price), 0));
  const safeDiscount = roundMoney(Math.max(0, discount));
  const safeTax = roundMoney(Math.max(0, tax));
  const grandTotal = roundMoney(Math.max(0, subtotal - safeDiscount + safeTax));
  return { subtotal, discount: safeDiscount, tax: safeTax, grandTotal, amountInWords: numberToWords(grandTotal) };
}
