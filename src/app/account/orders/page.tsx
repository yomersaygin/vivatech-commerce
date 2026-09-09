'use client';
import { useEffect,useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { StoreHeader } from '@/components/StoreHeader';
import { AccountGate } from '@/components/AccountGate';
import { AccountNav } from '@/components/AccountNav';
const money=(v:number)=>Number(v).toLocaleString('tr-TR',{style:'currency',currency:'TRY'});
const labels:Record<string,string>={new:'Yeni',confirmed:'Onaylandı',preparing:'Hazırlanıyor',shipped:'Kargolandı',delivered:'Teslim Edildi',cancelled:'İptal Edildi'};
export default function MyOrders(){const[orders,setOrders]=useState<any[]>([]);const[loading,setLoading]=useState(true);const[error,setError]=useState('');useEffect(()=>{(async()=>{const{data,error}=await supabase.from('orders').select('id,order_number,status,payment_status,total_amount,created_at').order('created_at',{ascending:false});if(error)setError(error.message);else setOrders(data||[]);setLoading(false)})();},[]);return <AccountGate><main className="store"><StoreHeader/><section className="account-shell"><AccountNav/><div className="account-main"><div className="section-head"><div><h1>Siparişlerim</h1><p className="muted">Geçmiş ve devam eden siparişleriniz.</p></div></div>{error&&<div className="error">{error}</div>}{loading?<div className="form-card">Yükleniyor…</div>:<div className="order-card-list">{orders.map(o=><Link className="order-card" key={o.id} href={`/account/orders/${o.id}`}><div><b>{o.order_number}</b><small>{new Date(o.created_at).toLocaleString('tr-TR')}</small></div><span className={`order-status ${o.status}`}>{labels[o.status]||o.status}</span><strong>{money(o.total_amount)}</strong></Link>)}{!orders.length&&<div className="form-card"><h2>Henüz siparişiniz yok</h2><Link className="button account-inline-button" href="/">Alışverişe Başla</Link></div>}</div>}</div></section></main></AccountGate>}
