'use client';
import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { StoreHeader } from '@/components/StoreHeader';
import { AccountNav } from '@/components/AccountNav';

export default function AccountPage(){
 const [user,setUser]=useState<any>(null); const [mode,setMode]=useState<'login'|'signup'>('login'); const [message,setMessage]=useState(''); const [busy,setBusy]=useState(false); const [stats,setStats]=useState({orders:0,addresses:0});
 useEffect(()=>{supabase.auth.getUser().then(async({data})=>{setUser(data.user);if(data.user) await loadStats();});},[]);
 async function loadStats(){const [{count:orders},{count:addresses}]=await Promise.all([supabase.from('orders').select('*',{count:'exact',head:true}),supabase.from('addresses').select('*',{count:'exact',head:true})]);setStats({orders:orders||0,addresses:addresses||0});}
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setMessage('');const fd=new FormData(e.currentTarget);const email=String(fd.get('email')||'');const password=String(fd.get('password')||'');
  if(mode==='login'){const {data,error}=await supabase.auth.signInWithPassword({email,password});if(error)setMessage(error.message);else{setUser(data.user);setMessage('Giriş başarılı.');await loadStats();}}
  else {const first_name=String(fd.get('first_name')||'');const last_name=String(fd.get('last_name')||'');const phone=String(fd.get('phone')||'');const emailRedirectTo=typeof window!=='undefined'?`${window.location.origin}/account`:undefined;const {data,error}=await supabase.auth.signUp({email,password,options:{data:{first_name,last_name,phone},emailRedirectTo}});if(error)setMessage(error.message);else if(data.session){setUser(data.user);setMessage('Hesabınız oluşturuldu.');await loadStats();}else setMessage('Hesap oluşturuldu. E-posta doğrulaması açıksa gelen bağlantıyı onaylayın.');}
  setBusy(false);
 }
 async function forgotPassword(){
  const emailInput=document.querySelector<HTMLInputElement>('input[name="email"]');
  const email=(emailInput?.value||'').trim();
  if(!email){setMessage('Önce e-posta adresinizi yazın.');return;}
  setBusy(true);setMessage('');
  const redirectTo=`${window.location.origin}/account/reset-password`;
  const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo});
  setMessage(error?error.message:'Şifre yenileme bağlantısı e-posta adresinize gönderildi.');
  setBusy(false);
 }
 if(!user)return <main className="store"><StoreHeader/><section className="checkout-page"><div className="section-head"><div><h1>Hesabım</h1><p className="muted">Siparişlerinizi, adreslerinizi ve profilinizi yönetin.</p></div><Link href="/">Mağazaya dön</Link></div><form className="form-card account-form" onSubmit={submit}><div className="form-actions"><button type="button" className="button secondary" onClick={()=>{setMode('login');setMessage('')}}>Giriş</button><button type="button" className="button secondary" onClick={()=>{setMode('signup');setMessage('')}}>Üye Ol</button></div><h2>{mode==='login'?'Giriş Yap':'Yeni Hesap'}</h2>{mode==='signup'&&<div className="form-grid two"><label>Ad<input required name="first_name"/></label><label>Soyad<input required name="last_name"/></label><label>Telefon<input name="phone" inputMode="tel"/></label></div>}<label>E-posta<input required type="email" name="email"/></label><label>Şifre<input required type="password" name="password" minLength={6}/></label>{message&&<div className="notice">{message}</div>}<button disabled={busy} className="button" type="submit">{busy?'İşleniyor…':mode==='login'?'Giriş Yap':'Hesap Oluştur'}</button>{mode==='login'&&<button disabled={busy} type="button" className="button secondary" onClick={forgotPassword}>Şifremi Unuttum</button>}</form></section></main>;
 return <main className="store"><StoreHeader/><section className="account-shell"><AccountNav/><div className="account-main"><div className="section-head"><div><h1>Hoş geldiniz</h1><p className="muted">{user.email}</p></div><button className="button secondary" onClick={async()=>{await supabase.auth.signOut();setUser(null)}}>Çıkış Yap</button></div><div className="account-stats"><Link className="card" href="/account/orders"><b>{stats.orders}</b><span>Sipariş</span></Link><Link className="card" href="/account/addresses"><b>{stats.addresses}</b><span>Kayıtlı Adres</span></Link><Link className="card" href="/account/profile"><b>Profil</b><span>Bilgilerimi düzenle</span></Link></div><div className="form-card"><h2>Hızlı İşlemler</h2><div className="account-actions"><Link className="button" href="/account/orders">Siparişlerimi Gör</Link><Link className="button secondary" href="/account/addresses">Adreslerimi Yönet</Link><Link className="button secondary" href="/">Alışverişe Devam Et</Link></div></div></div></section></main>
}
