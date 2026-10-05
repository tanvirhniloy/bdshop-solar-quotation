export function formatBDT(value: number) {
  return `৳ ${new Intl.NumberFormat('en-BD', { minimumFractionDigits: Number.isInteger(value) ? 0 : 2, maximumFractionDigits: 2 }).format(value)}`;
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-BD', { maximumFractionDigits: 2 }).format(value);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`));
}
