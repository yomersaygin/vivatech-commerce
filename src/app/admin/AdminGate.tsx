'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AdminGate({children}:{children:React.ReactNode}){
  const router=useRouter();
  const pathname=usePathname();
  const isPublicAdminRoute=pathname==='/admin/login' || pathname==='/admin/logout';
  const [state,setState]=useState<'loading'|'ok'|'denied'>('loading');
  useEffect(()=>{
    if(isPublicAdminRoute) return;
    let active=true;
    (async()=>{
      const {data:{user}}=await supabase.auth.getUser();
      if(!user){ if(active) router.replace('/admin/login'); return; }
      const {data,error}=await supabase.rpc('is_admin');
      if(!active) return;
      if(error || data!==true){ setState('denied'); return; }
      setState('ok');
    })();
    return()=>{active=false};
  },[isPublicAdminRoute,router]);
  if(isPublicAdminRoute) return <>{children}</>;
  if(state==='loading') return <main className="login-wrap"><div className="login-card"><b>Yetki kontrol ediliyor…</b></div></main>;
  if(state==='denied') return <main className="login-wrap"><div className="login-card"><h1>Erişim reddedildi</h1><p>Bu kullanıcı yönetici değil.</p><button className="button" onClick={async()=>{await supabase.auth.signOut();router.replace('/admin/login')}}>Çıkış yap</button></div></main>;
  return <>{children}</>;
}
