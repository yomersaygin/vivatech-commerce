'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
const money=(v:number)=>Number(v||0).toLocaleString('tr-TR',{style:'currency',currency:'TRY'});
const labels:Record<string,string>={new:'Yeni',confirmed:'Onaylandı',preparing:'Hazırlanıyor',shipped:'Kargolandı',delivered:'Teslim Edildi',cancelled:'İptal Edildi'};
const paymentLabels:Record<string,string>={pending:'Bekliyor',paid:'Ödendi',failed:'Başarısız',refunded:'İade Edildi',cancelled:'İptal Edildi'};
type CustomerSummary={first_name:string|null;last_name:string|null;email:string|null};
type AdminOrderSummary={id:string;order_number:string;status:string;payment_status:string;total_amount:number;created_at:string;customers:CustomerSummary[]|null};
export default function AdminOrders(){
 const [orders,setOrders]=useState<AdminOrderSummary[]>([]); const [error,setError]=useState(''); const [loading,setLoading]=useState(true);
 useEffect(()=>{let active=true;(async()=>{setLoading(true);setError('');try{const {data,error}=await supabase.from('orders').select('id,order_number,status,payment_status,total_amount,created_at,customers(first_name,last_name,email)').order('created_at',{ascending:false});if(!active)return;if(error)setError('Siparişler yüklenemedi. Lütfen tekrar deneyin.');else setOrders((data||[]) as AdminOrderSummary[])}catch{if(active)setError('Siparişler yüklenirken beklenmeyen bir hata oluştu.')}finally{if(active)setLoading(false)}})();return()=>{active=false}},[]);
 return <><div className="section-head"><div><h1>Siparişler</h1><p className="muted">Sipariş detayını görüntüleyin ve durumunu yönetin.</p></div></div>{error&&<div className="error">{error}</div>}{loading?<div className="form-card">Yükleniyor…</div>:!error?<div className="table-wrap"><table><thead><tr><th>Sipariş</th><th>Müşteri</th><th>Durum</th><th>Ödeme</th><th>Toplam</th><th>Tarih</th><th></th></tr></thead><tbody>{orders.map(o=>{const customer=o.customers?.[0];return <tr key={o.id}><td><b>{o.order_number}</b></td><td>{customer?[`${customer.first_name||''} ${customer.last_name||''}`.trim(),customer.email].filter(Boolean).join(' · '):'—'}</td><td>{labels[o.status]||o.status}</td><td>{paymentLabels[o.payment_status]||o.payment_status||'—'}</td><td>{money(o.total_amount)}</td><td>{new Date(o.created_at).toLocaleString('tr-TR')}</td><td><Link className="button secondary" href={`/admin/orders/${o.id}`}>Detay</Link></td></tr>})}{!orders.length&&<tr><td colSpan={7}>Henüz sipariş yok.</td></tr>}</tbody></table></div>:null}</>;
}
