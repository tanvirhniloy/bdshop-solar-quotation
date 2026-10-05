import { describe, expect, it } from 'vitest';
import { calculateTotals } from '@/lib/quotation/calculations';
import { numberToWords } from '@/lib/quotation/number-to-words';

describe('quotation calculations', () => {
  it('calculates the requested example', () => {
    const items = [
      { quantity: 1, unit_price: 40000 },
      { quantity: 2, unit_price: 35000 },
      { quantity: 6, unit_price: 12000 },
    ];
    const totals = calculateTotals(items, 2000, 0);
    expect(totals.subtotal).toBe(182000);
    expect(totals.grandTotal).toBe(180000);
    expect(totals.amountInWords).toBe('One Hundred Eighty Thousand Taka Only');
  });
  it('handles Bangladesh lakh/crore wording', () => {
    expect(numberToWords(125500)).toBe('One Hundred Twenty-Five Thousand Five Hundred Taka Only');
    expect(numberToWords(180000)).toBe('One Hundred Eighty Thousand Taka Only');
  });
});
