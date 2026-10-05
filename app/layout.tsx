import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'BDSHOP Solar & IPS Quotation Maker',
  description: 'Internal quotation management for BDSHOP Solar & IPS division.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}<Toaster position="top-right" /></body></html>;
}
