'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
const money=(v:number)=>Number(v).toLocaleString('tr-TR',{style:'currency',currency:'TRY'});
const labels:Record<string,string>={new:'Yeni',confirmed:'Onaylandı',preparing:'Hazırlanıyor',shipped:'Kargolandı',delivered:'Teslim Edildi',cancelled:'İptal Edildi'};
export default function AdminOrders(){
 const [orders,setOrders]=useState<any[]>([]); const [error,setError]=useState('');
 useEffect(()=>{(async()=>{const {data,error}=await supabase.from('orders').select('id,order_number,status,payment_status,total_amount,created_at,customers(first_name,last_name,email)').order('created_at',{ascending:false});if(error)setError(error.message);else setOrders(data||[]);})();},[]);
 return <><div className="section-head"><div><h1>Siparişler</h1><p className="muted">Sipariş detayını görüntüleyin ve durumunu yönetin.</p></div></div>{error&&<div className="error">{error}</div>}<div className="table-wrap"><table><thead><tr><th>Sipariş</th><th>Müşteri</th><th>Durum</th><th>Ödeme</th><th>Toplam</th><th>Tarih</th><th></th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td><b>{o.order_number}</b></td><td>{o.customers?[`${o.customers.first_name} ${o.customers.last_name}`,o.customers.email].filter(Boolean).join(' · '):'—'}</td><td>{labels[o.status]||o.status}</td><td>{o.payment_status}</td><td>{money(o.total_amount)}</td><td>{new Date(o.created_at).toLocaleString('tr-TR')}</td><td><Link className="button secondary" href={`/admin/orders/${o.id}`}>Detay</Link></td></tr>)}{!orders.length&&!error&&<tr><td colSpan={7}>Henüz sipariş yok.</td></tr>}</tbody></table></div></>;
}
