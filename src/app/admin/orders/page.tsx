'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import AdminFeedback from '../AdminFeedback';

const money=(v:number)=>Number(v||0).toLocaleString('tr-TR',{style:'currency',currency:'TRY'});
const labels:Record<string,string>={new:'Yeni',confirmed:'Onaylandı',preparing:'Hazırlanıyor',shipped:'Kargolandı',delivered:'Teslim Edildi',cancelled:'İptal Edildi'};
const paymentLabels:Record<string,string>={pending:'Bekliyor',paid:'Ödendi',failed:'Başarısız',refunded:'İade Edildi',cancelled:'İptal Edildi'};
type CustomerSummary={first_name:string|null;last_name:string|null;email:string|null};
type AdminOrderSummary={id:string;order_number:string;status:string;payment_status:string;total_amount:number;created_at:string;customers:CustomerSummary[]|null};

export default function AdminOrders(){
  const [orders,setOrders]=useState<AdminOrderSummary[]>([]);
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(true);
  const [query,setQuery]=useState('');
  const [status,setStatus]=useState('all');
  const [payment,setPayment]=useState('all');

  useEffect(()=>{let active=true;(async()=>{setLoading(true);setError('');try{const {data,error}=await supabase.from('orders').select('id,order_number,status,payment_status,total_amount,created_at,customers(first_name,last_name,email)').order('created_at',{ascending:false});if(!active)return;if(error)setError('Siparişler yüklenemedi. Lütfen tekrar deneyin.');else setOrders((data||[]) as AdminOrderSummary[])}catch{if(active)setError('Siparişler yüklenirken beklenmeyen bir hata oluştu.')}finally{if(active)setLoading(false)}})();return()=>{active=false}},[]);
  const filtered=useMemo(()=>{const needle=query.trim().toLocaleLowerCase('tr-TR');return orders.filter(o=>{const customer=o.customers?.[0];const haystack=[o.order_number,customer?.first_name,customer?.last_name,customer?.email].filter(Boolean).join(' ').toLocaleLowerCase('tr-TR');return (!needle||haystack.includes(needle))&&(status==='all'||o.status===status)&&(payment==='all'||o.payment_status===payment)})},[orders,query,status,payment]);
  const clearFilters=()=>{setQuery('');setStatus('all');setPayment('all')};

  return <>
    <div className="section-head"><div><h1>Siparişler</h1><p className="muted">Sipariş detayını görüntüleyin ve durumunu yönetin.</p></div></div>
    {error&&<AdminFeedback tone="error" message={error}/>}
    <div aria-busy={loading}>
      {loading?<div className="form-card" role="status">Yükleniyor…</div>:!error?<>
        <div className="admin-order-summary"><div className="card"><b>{orders.length}</b><span>Toplam sipariş</span></div><div className="card"><b>{orders.filter(o=>['new','confirmed','preparing'].includes(o.status)).length}</b><span>İşlem bekleyen</span></div><div className="card"><b>{orders.filter(o=>o.status==='shipped').length}</b><span>Kargoda</span></div><div className="card"><b>{orders.filter(o=>o.payment_status==='paid').length}</b><span>Ödemesi alınan</span></div></div>
        <div className="admin-order-filters"><label>Arama<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Sipariş no, müşteri veya e-posta"/></label><label>Sipariş durumu<select value={status} onChange={e=>setStatus(e.target.value)}><option value="all">Tümü</option>{Object.entries(labels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><label>Ödeme durumu<select value={payment} onChange={e=>setPayment(e.target.value)}><option value="all">Tümü</option>{Object.entries(paymentLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><button type="button" className="button secondary" onClick={clearFilters}>Filtreleri Temizle</button></div>
        <p className="result-count">{filtered.length} / {orders.length} sipariş gösteriliyor</p>
        <div className="table-wrap"><table><thead><tr><th>Sipariş</th><th>Müşteri</th><th>Durum</th><th>Ödeme</th><th>Toplam</th><th>Tarih</th><th></th></tr></thead><tbody>{filtered.map(o=>{const customer=o.customers?.[0];return <tr key={o.id}><td><b>{o.order_number}</b></td><td>{customer?[`${customer.first_name||''} ${customer.last_name||''}`.trim(),customer.email].filter(Boolean).join(' · '):'—'}</td><td><span className={`order-status ${o.status}`}>{labels[o.status]||o.status}</span></td><td><span className={`payment-status ${o.payment_status}`}>{paymentLabels[o.payment_status]||o.payment_status||'—'}</span></td><td>{money(o.total_amount)}</td><td>{new Date(o.created_at).toLocaleString('tr-TR')}</td><td><Link className="button secondary compact" href={`/admin/orders/${o.id}`}>Detay</Link></td></tr>})}{!filtered.length&&<tr><td colSpan={7}>{orders.length?'Filtrelere uygun sipariş bulunamadı.':'Henüz sipariş yok.'}</td></tr>}</tbody></table></div>
      </>:null}
    </div>
  </>;
}
