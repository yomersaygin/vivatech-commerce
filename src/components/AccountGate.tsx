'use client';
import { ReactNode, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { StoreHeader } from '@/components/StoreHeader';
import Link from 'next/link';

export function AccountGate({children}:{children:ReactNode}){
  const [state,setState]=useState<'loading'|'signed-in'|'signed-out'>('loading');
  useEffect(()=>{
    supabase.auth.getUser().then(({data})=>setState(data.user?'signed-in':'signed-out'));
    const {data:listener}=supabase.auth.onAuthStateChange((_event,session)=>setState(session?.user?'signed-in':'signed-out'));
    return ()=>listener.subscription.unsubscribe();
  },[]);
  if(state==='loading') return <main className="store"><StoreHeader/><section className="account-shell"><div className="form-card">Hesap bilgileri yükleniyor…</div></section></main>;
  if(state==='signed-out') return <main className="store"><StoreHeader/><section className="account-shell"><div className="form-card"><h1>Giriş gerekli</h1><p className="muted">Siparişlerinizi ve adreslerinizi görmek için hesabınıza giriş yapın.</p><Link className="button account-inline-button" href="/account">Giriş Yap / Üye Ol</Link></div></section></main>;
  return <>{children}</>;
}
