const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function underThousand(n: number): string {
  const parts: string[] = [];
  if (n >= 100) { parts.push(`${ones[Math.floor(n / 100)]} Hundred`); n %= 100; }
  if (n >= 20) { const ten = tens[Math.floor(n / 10)]; n %= 10; parts.push(n ? `${ten}-${ones[n]}` : ten); }
  else if (n) parts.push(ones[n]);
  return parts.join(' ');
}

function integerWords(n: number): string {
  if (n === 0) return 'Zero';
  const groups = [
    { value: 1_000_000_000, name: 'Billion' },
    { value: 1_000_000, name: 'Million' },
    { value: 1_000, name: 'Thousand' },
  ];
  const parts: string[] = [];
  for (const group of groups) {
    if (n >= group.value) {
      const count = Math.floor(n / group.value);
      n %= group.value;
      parts.push(`${integerWords(count)} ${group.name}`);
    }
  }
  if (n) parts.push(underThousand(n));
  return parts.join(' ');
}

export function numberToWords(amount: number): string {
  const safe = Math.max(0, Math.round(amount * 100) / 100);
  const taka = Math.floor(safe);
  const paisa = Math.round((safe - taka) * 100);
  const main = `${integerWords(taka)} Taka`;
  return paisa ? `${main} and ${integerWords(paisa)} Paisa Only` : `${main} Only`;
}
