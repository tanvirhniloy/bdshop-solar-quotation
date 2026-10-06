'use client';
import { forwardRef, useMemo } from 'react';
import type { Quotation, QuotationItem, QuotationSettings } from '@/types/quotation';
import { formatBDT, formatDate, formatNumber } from '@/lib/utils';

function chunk<T>(items:T[], size:number){ const out:T[][]=[]; for(let i=0;i<items.length;i+=size) out.push(items.slice(i,i+size)); return out; }

function Page({ quotation, settings, items, pageNumber, totalPages, showCustomer, showTerms, itemOffset }: {quotation:Quotation;settings:QuotationSettings;items:QuotationItem[];pageNumber:number;totalPages:number;showCustomer:boolean;showTerms:boolean;itemOffset: number}) {
 return <div className="a4-page quotation-page shadow-lg mb-5">
   <div className="a4-content text-[11px] leading-[1.35]">
     <div className="flex items-start justify-between border-b-2 border-[#15458f] pb-2 mb-3"><div><div className="text-[22px] font-extrabold tracking-wide text-[#15458f]">QUOTATION</div><div className="text-[9px] text-slate-500">Solar & IPS Division</div></div><div className="text-right"><div><b>Quotation No:</b> {quotation.quotation_number}</div><div><b>Date:</b> {formatDate(quotation.quotation_date)}</div><div><b>Validity:</b> {quotation.validity_days} days</div></div></div>
     {showCustomer && <div className="mb-3"><div className="font-bold text-[#15458f] mb-1.5">Customer Information</div><div className="grid grid-cols-2 gap-x-5 gap-y-1 border border-slate-200 rounded-md p-2.5 bg-white/80"><div><b>Customer:</b> {quotation.customer_name}</div><div><b>Company:</b> {quotation.customer_company || '—'}</div><div><b>Phone:</b> {quotation.customer_phone || '—'}</div><div><b>Email:</b> {quotation.customer_email || '—'}</div><div className="col-span-2"><b>Address:</b> {quotation.customer_address || '—'}</div><div className="col-span-2"><b>Prepared By:</b> {quotation.customer_reference || '—'}</div></div></div>}
     <div className="border border-slate-300 rounded-md overflow-hidden bg-white/95"><table className="w-full border-collapse"><thead><tr className="bg-[#15458f] text-white"><th className="p-1.5 text-left w-[6%]">SL</th><th className="p-1.5 text-left w-[16%]">Category</th><th className="p-1.5 text-left">Item Description</th><th className="p-1.5 text-right w-[8%]">Qty</th><th className="p-1.5 text-left w-[8%]">Unit</th><th className="p-1.5 text-right w-[15%]">Unit Price</th><th className="p-1.5 text-right w-[15%]">Total</th></tr></thead><tbody>{items.map((item,index)=><tr key={item.id||`${pageNumber}-${index}`} className="border-t border-slate-200 align-top"><td className="p-1.5">{itemOffset + index + 1}</td><td className="p-1.5">{item.category}</td><td className="p-1.5"><div className="font-semibold">{item.item_name}</div>{item.description&&<div className="text-[9px] text-slate-500">{item.description}</div>}</td><td className="p-1.5 text-right">{formatNumber(item.quantity)}</td><td className="p-1.5">{item.unit}</td><td className="p-1.5 text-right whitespace-nowrap">{formatBDT(item.unit_price)}</td><td className="p-1.5 text-right whitespace-nowrap">{formatBDT(item.total_price)}</td></tr>)}</tbody></table></div>
     {showTerms && <div className="mt-3"><div className="grid grid-cols-[1fr_250px] gap-4 items-start"><div><div className="font-bold text-[#15458f] mb-1">Terms & Condition / Notes</div><div className="whitespace-pre-line text-[9.5px] border border-slate-200 rounded-md p-2.5 bg-white/85">{quotation.terms_and_conditions}</div></div><div className="border border-slate-300 rounded-md overflow-hidden bg-white/95"><div className="flex justify-between px-3 py-2 border-b"><span>Subtotal</span><b>{formatBDT(quotation.subtotal)}</b></div><div className="flex justify-between px-3 py-2 border-b"><span>Discount</span><b>- {formatBDT(quotation.discount)}</b></div><div className="flex justify-between px-3 py-2 border-b"><span>Tax/VAT</span><b>{formatBDT(quotation.tax)}</b></div><div className="flex justify-between px-3 py-2 bg-[#eef4fb] text-[#15458f] text-[13px]"><span className="font-bold">Grand Total</span><b>{formatBDT(quotation.grand_total)}</b></div></div></div><div className="mt-2 border border-slate-200 rounded-md p-2 bg-white/85"><b>Amount in Words:</b> {quotation.amount_in_words}</div><div className="mt-3 text-right text-[10px] text-slate-500">Prepared By: <b>{quotation.creator?.full_name || 'BDSHOP Solar & IPS Division'}</b></div></div>}
     {!showTerms && <div className="mt-3 text-right text-[9px] text-slate-400">Page {pageNumber} of {totalPages}</div>}
   </div>
 </div>;
}

const QuotationPreview = forwardRef<HTMLDivElement, {quotation:Quotation;settings:QuotationSettings; scale?:number}>(function QuotationPreview({quotation,settings,scale=1}, ref){
 const pages=useMemo(()=>{ const itemPages=chunk(quotation.items, 12); return itemPages.length?itemPages:[[]]; },[quotation.items]);
 return <div ref={ref} className="quotation-preview-space" style={{transform:`scale(${scale})`,transformOrigin:'top left',width:'210mm'}}>
   {pages.map((items,i)=><Page key={i} quotation={quotation} settings={settings} items={items} pageNumber={i+1} totalPages={pages.length} showCustomer={i===0} showTerms={i===pages.length-1} itemOffset={i*12}/>)}
 </div>;
});

export default QuotationPreview;
