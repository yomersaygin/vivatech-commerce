'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from './CartProvider';

export function StoreHeader(){
 const {count,subtotal}=useCart(); const router=useRouter(); const [q,setQ]=useState('');
 const submit=(e:FormEvent)=>{e.preventDefault();const value=q.trim();router.push(value?`/products?q=${encodeURIComponent(value)}`:'/products')};
 return <>
  <div className="store-topbar"><div><span>🛡️ 2 Yıl Garanti</span><i/> <span>🚚 Hızlı Gönderim</span><i/> <span>🔒 Güvenli Alışveriş</span></div><span>🎧 Müşteri Hizmetleri</span></div>
  <header className="store-header">
   <Link href="/" className="store-logo"><span>VIVA</span><b>TECH</b><small>DAHA GÜVENLİ YARINLAR</small></Link>
   <form className="header-search" onSubmit={submit}><input aria-label="Ürün ara" value={q} onChange={e=>setQ(e.target.value)} placeholder="Ürün, kategori veya model ara..."/><button type="submit" aria-label="Ara">⌕</button></form>
   <div className="store-actions"><Link href="/account" className="account-link"><span className="action-icon">♙</span><span><b>Hesabım</b><small>Giriş Yap</small></span></Link><Link href="/cart" className="cart-link"><span className="action-icon">🛒</span><span><b>Sepetim <em>{count}</em></b><small>{subtotal.toLocaleString('tr-TR',{style:'currency',currency:'TRY'})}</small></span></Link></div>
  </header>
  <nav className="category-nav"><Link className="all-categories" href="/#kategoriler">☰ Tüm Kategoriler</Link><Link href="/products?q=4G">4G Kameralar</Link><Link href="/products?q=Solar">Solar Kameralar</Link><Link href="/products?q=WiFi">WiFi Kameralar</Link><Link href="/products?q=PTZ">PTZ Kameralar</Link><Link href="/products">Aksesuarlar</Link><Link href="/products">Kayıt Cihazları</Link><Link href="/products">Akıllı Ev Ürünleri</Link><Link className="campaign-link" href="/products">% Kampanyalar</Link></nav>
 </>;
}
