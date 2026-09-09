'use client';
import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { StoreHeader } from '@/components/StoreHeader';
import { useCart } from '@/components/CartProvider';
import { CouponBox } from '@/components/CouponBox';
import { supabase } from '@/lib/supabase';
const money=(v:number)=>v.toLocaleString('tr-TR',{style:'currency',currency:'TRY'});
export default function CheckoutPage(){
 const {items,subtotal,coupon,discount,total,clearCart}=useCart(); const [user,setUser]=useState<any>(undefined); const [busy,setBusy]=useState(false); const [result,setResult]=useState<{order?:string,error?:string}>({});
 useEffect(()=>{supabase.auth.getUser().then(({data})=>setUser(data.user));},[]);
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();if(!user||!items.length)return;setBusy(true);setResult({});const fd=new FormData(e.currentTarget);
  const {data:customer,error:cErr}=await supabase.from('customers').select('id').eq('auth_user_id',user.id).single();if(cErr||!customer){setResult({error:'Müşteri profili bulunamadı.'});setBusy(false);return;}
  const {data:address,error:aErr}=await supabase.from('addresses').insert({customer_id:customer.id,title:'Teslimat',full_name:String(fd.get('full_name')),phone:String(fd.get('phone')),city:String(fd.get('city')),district:String(fd.get('district')),address_line:String(fd.get('address')),is_default:true}).select('id').single();if(aErr||!address){setResult({error:aErr?.message||'Adres kaydedilemedi.'});setBusy(false);return;}
  const orderNumber=`WEB-${Date.now()}`; const payload=items.map(x=>({product_id:x.id,quantity:x.quantity}));
  const {data:orderId,error:oErr}=await supabase.rpc('create_customer_order_with_stock_v2',{p_order_number:orderNumber,p_shipping_address_id:address.id,p_items:payload,p_notes:null,p_coupon_code:coupon?.code||null});
  if(oErr){setResult({error:oErr.message});setBusy(false);return;} clearCart();setResult({order:orderNumber});setBusy(false);
 }
 if(user===undefined)return <main className="store"><StoreHeader/><section className="checkout-page"><p>Oturum kontrol ediliyor…</p></section></main>;
 return <main className="store"><StoreHeader/><section className="checkout-page"><div className="section-head"><div><h1>Checkout</h1><p className="muted">Teslimat bilgileri ve gerçek sipariş kaydı.</p></div><Link href="/cart">← Sepete dön</Link></div>
 {!user?<div className="empty-cart"><h2>Sipariş için giriş yapmalısınız.</h2><p>Üye olduktan sonra sepetiniz korunur.</p><Link className="button" href="/account">Giriş Yap / Üye Ol</Link></div>:
 result.order?<div className="checkout-success"><h2>Siparişiniz alındı ✓</h2><p>Sipariş numarası: <strong>{result.order}</strong></p><p>Stok işlemi siparişle aynı veritabanı işlemi içinde tamamlandı.</p><Link className="button" href="/">Alışverişe dön</Link></div>:
 !items.length?<div className="empty-cart"><h2>Sepetiniz boş.</h2><Link className="button" href="/">Ürünleri İncele</Link></div>:
 <form className="checkout-layout" onSubmit={submit}><div className="checkout-form"><div className="form-card"><h2>Teslimat Bilgileri</h2><div className="form-grid two"><label>Ad Soyad<input required name="full_name"/></label><label>Telefon<input required name="phone" inputMode="tel"/></label></div><div className="form-grid two"><label>Şehir<input required name="city"/></label><label>İlçe<input required name="district"/></label></div><label>Adres<textarea required name="address" rows={4}/></label>{result.error&&<div className="error">{result.error}</div>}</div></div><aside className="cart-summary"><h2>Sipariş Özeti</h2>{items.map(item=><div key={item.id}><span>{item.name} × {item.quantity}</span><strong>{money(item.price*item.quantity)}</strong></div>)}<CouponBox/>{discount>0&&<div><span>Kupon indirimi</span><strong>−{money(discount)}</strong></div>}<hr/><div className="summary-total"><span>Toplam</span><strong>{money(total)}</strong></div><button disabled={busy} className="button" type="submit">{busy?'Sipariş oluşturuluyor…':'Siparişi Oluştur'}</button><small>Ödeme entegrasyonu henüz aktif değildir; ödeme durumu beklemede oluşturulur.</small></aside></form>}
 </section></main>
}
