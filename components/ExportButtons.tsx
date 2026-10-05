'use client';
import { useState } from 'react';
import { Download, Image as ImageIcon, Printer, FileDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { pdf } from '@react-pdf/renderer';
import { toPng } from 'html-to-image';
import QuotationPdf from './QuotationPdf';
import type { Quotation, QuotationSettings } from '@/types/quotation';

export default function ExportButtons({quotation,settings,previewRef}:{quotation:Quotation;settings:QuotationSettings;previewRef:React.RefObject<HTMLDivElement|null>}){
 const [loading,setLoading]=useState('');
 async function downloadPdf(){setLoading('pdf');try{const blob=await pdf(<QuotationPdf quotation={quotation} settings={settings}/>).toBlob();const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`BDSHOP-Quotation-${quotation.quotation_number}.pdf`;a.click();URL.revokeObjectURL(url);fetch(`/api/quotations/${quotation.id}/activity`,{method:'POST',body:JSON.stringify({action:'Downloaded',metadata:{format:'pdf'}})}).catch(()=>{});toast.success('PDF downloaded.')}catch{toast.error('Unable to generate PDF. Please try again.')}finally{setLoading('');}}
 async function downloadPng(){setLoading('png');try{const pages=previewRef.current?.querySelectorAll('.quotation-page');if(!pages?.length)throw new Error('Preview not found');if(pages.length===1){const data=await toPng(pages[0] as HTMLElement,{pixelRatio:2,cacheBust:true});const a=document.createElement('a');a.href=data;a.download=`BDSHOP-Quotation-${quotation.quotation_number}.png`;a.click();}else{for(let i=0;i<pages.length;i++){const data=await toPng(pages[i] as HTMLElement,{pixelRatio:2,cacheBust:true});const a=document.createElement('a');a.href=data;a.download=`BDSHOP-Quotation-${quotation.quotation_number}-page-${i+1}.png`;a.click();await new Promise(r=>setTimeout(r,150));}}toast.success('PNG export ready.')}catch{toast.error('Unable to generate PNG. Please try again.')}finally{setLoading('');}}
 function print(){window.print();}
 return <div className="flex flex-wrap gap-2 no-print"><button className="btn btn-primary" onClick={downloadPdf} disabled={!!loading}><FileDown size={15}/>{loading==='pdf'?'Generating...':'Download PDF'}</button><button className="btn btn-secondary" onClick={downloadPng} disabled={!!loading}><ImageIcon size={15}/>{loading==='png'?'Generating...':'Download PNG'}</button><button className="btn btn-secondary" onClick={print} disabled={!!loading}><Printer size={15}/>Print</button></div>;
}
