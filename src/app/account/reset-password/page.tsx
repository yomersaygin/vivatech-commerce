'use client';
import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { StoreHeader } from '@/components/StoreHeader';

export default function ResetPasswordPage(){
 const [ready,setReady]=useState(false);const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);
 useEffect(()=>{
  supabase.auth.getSession().then(({data})=>setReady(Boolean(data.session)));
  const {data:listener}=supabase.auth.onAuthStateChange((_event,session)=>setReady(Boolean(session)));
  return()=>listener.subscription.unsubscribe();
 },[]);
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setMessage('');const fd=new FormData(e.currentTarget);const password=String(fd.get('password')||'');const confirm=String(fd.get('confirm')||'');if(password.length<6){setMessage('Şifre en az 6 karakter olmalı.');setBusy(false);return;}if(password!==confirm){setMessage('Şifreler eşleşmiyor.');setBusy(false);return;}const {error}=await supabase.auth.updateUser({password});setMessage(error?error.message:'Şifreniz başarıyla yenilendi. Artık hesabınıza giriş yapabilirsiniz.');setBusy(false);}
 return <main className="store"><StoreHeader/><section className="checkout-page"><div className="section-head"><div><h1>Şifre Yenile</h1><p className="muted">Yeni şifrenizi belirleyin.</p></div><Link href="/account">Hesabıma dön</Link></div><form className="form-card account-form" onSubmit={submit}>{!ready&&<div className="notice">Şifre yenileme bağlantınızı doğruluyoruz. E-postadaki bağlantı üzerinden geldiğinizden emin olun.</div>}<label>Yeni Şifre<input required type="password" name="password" minLength={6}/></label><label>Yeni Şifre Tekrar<input required type="password" name="confirm" minLength={6}/></label>{message&&<div className="notice">{message}</div>}<button disabled={busy||!ready} className="button" type="submit">{busy?'Kaydediliyor…':'Şifreyi Güncelle'}</button></form></section></main>;
}
