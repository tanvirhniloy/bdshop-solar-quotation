export const CATEGORIES = [
  'Inverter', 'Battery', 'Solar Panel', 'PV', 'Cable', 'ATS', 'SPD',
  'MCCB', 'Structure', 'MC4', 'MTS', 'Others',
] as const;

export type Category = (typeof CATEGORIES)[number];
export type QuotationStatus = 'Draft' | 'Generated' | 'Sent' | 'Approved' | 'Rejected' | 'Cancelled';

export interface QuotationItem {
  id?: string;
  category: Category | string;
  item_name: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  sort_order: number;
}

export interface Quotation {
  id: string;
  quotation_number: string;
  customer_name: string;
  customer_company: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  customer_address: string | null;
  customer_reference: string | null;
  quotation_date: string;
  validity_days: number;
  subtotal: number;
  discount: number;
  tax: number;
  grand_total: number;
  amount_in_words: string;
  terms_and_conditions: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  status: QuotationStatus;
  items: QuotationItem[];
  creator?: { full_name: string; email: string } | null;
}

export interface QuotationPayload {
  id?: string;
  customer_name: string;
  customer_company?: string;
  customer_phone?: string;
  customer_email?: string;
  customer_address?: string;
  customer_reference?: string;
  quotation_date: string;
  validity_days: number;
  discount: number;
  tax: number;
  terms_and_conditions: string;
  items: Omit<QuotationItem, 'id' | 'total_price'>[];
  status?: QuotationStatus;
}

export interface QuotationSettings {
  id: number;
  company_name: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  website: string;
  default_terms: string;
  quotation_prefix: string;
  currency: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: 'ADMIN' | 'STAFF';
}
