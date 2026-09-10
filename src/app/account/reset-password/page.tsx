'use client';
import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { StoreHeader } from '@/components/StoreHeader';

export default function ResetPasswordPage(){
 const router=useRouter();
 const [ready,setReady]=useState(false);const [checking,setChecking]=useState(true);const [message,setMessage]=useState('');const [error,setError]=useState('');const [busy,setBusy]=useState(false);
 useEffect(()=>{
  let active=true;
  const finish=(session:any)=>{if(!active)return;setReady(Boolean(session));setChecking(false)};
  supabase.auth.getSession().then(({data,error})=>{if(!active)return;if(error){setError('Şifre yenileme bağlantısı doğrulanamadı. Lütfen yeni bir bağlantı isteyin.');setChecking(false);return}finish(data.session)});
  const {data:listener}=supabase.auth.onAuthStateChange((event,session)=>{
   if(!active)return;
   if(event==='PASSWORD_RECOVERY'){setReady(Boolean(session));setChecking(false);setError('');}
   else if(event==='SIGNED_OUT'){setReady(false);setChecking(false);}
  });
  return()=>{active=false;listener.subscription.unsubscribe()};
 },[]);
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(!ready||busy)return;setBusy(true);setMessage('');setError('');
  const fd=new FormData(e.currentTarget);const password=String(fd.get('password')||'');const confirm=String(fd.get('confirm')||'');
  if(password.length<6){setError('Şifre en az 6 karakter olmalı.');setBusy(false);return;}
  if(password!==confirm){setError('Şifreler eşleşmiyor.');setBusy(false);return;}
  try{
   const {error}=await supabase.auth.updateUser({password});
   if(error){setError('Şifreniz güncellenemedi. Bağlantının süresi dolmuş olabilir; yeni bir şifre yenileme bağlantısı isteyin.');return;}
   setMessage('Şifreniz başarıyla yenilendi. Giriş ekranına yönlendiriliyorsunuz…');
   await supabase.auth.signOut();
   setTimeout(()=>router.replace('/account'),900);
  }catch{setError('Şifre yenilenirken beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.');}
  finally{setBusy(false);}
 }
 return <main className="store"><StoreHeader/><section className="checkout-page"><div className="section-head"><div><h1>Şifre Yenile</h1><p className="muted">Yeni şifrenizi belirleyin.</p></div><Link href="/account">Hesabıma dön</Link></div><form className="form-card account-form" onSubmit={submit}>{checking&&<div className="notice">Şifre yenileme bağlantınız doğrulanıyor…</div>}{!checking&&!ready&&!error&&<div className="notice">Geçerli bir şifre yenileme oturumu bulunamadı. E-postadaki bağlantıyı yeniden açın.</div>}{error&&<div className="error">{error}</div>}<label>Yeni Şifre<input required type="password" name="password" minLength={6} autoComplete="new-password"/></label><label>Yeni Şifre Tekrar<input required type="password" name="confirm" minLength={6} autoComplete="new-password"/></label>{message&&<div className="notice">{message}</div>}<button disabled={busy||!ready} className="button" type="submit">{busy?'Kaydediliyor…':'Şifreyi Güncelle'}</button></form></section></main>;
}
