'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from './CartProvider';
export function StoreHeader(){const {count}=useCart();const router=useRouter();const [q,setQ]=useState('');const submit=(e:FormEvent)=>{e.preventDefault();const value=q.trim();router.push(value?`/products?q=${encodeURIComponent(value)}`:'/products')};return <header className="store-header"><Link href="/" className="store-logo">VIVATECH</Link><nav><Link href="/#kategoriler">Kategoriler</Link><Link href="/products">Ürünler</Link><Link href="/admin">Yönetim</Link></nav><form className="header-search" onSubmit={submit}><input aria-label="Ürün ara" value={q} onChange={e=>setQ(e.target.value)} placeholder="Ürün ara..."/><button type="submit">Ara</button></form><div className="store-actions"><Link href="/account">Hesabım</Link><Link href="/cart" className="cart-link">Sepet <b>{count}</b></Link></div></header>}
