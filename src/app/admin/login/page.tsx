'use client';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Login(){
 const router=useRouter(); const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [msg,setMsg]=useState(''); const [busy,setBusy]=useState(false);
 useEffect(()=>{supabase.auth.getUser().then(({data})=>{if(data.user) router.replace('/admin')})},[router]);
 async function submit(e:FormEvent){e.preventDefault();setBusy(true);setMsg('');const {error}=await supabase.auth.signInWithPassword({email,password});setBusy(false);if(error){setMsg('Giriş başarısız: '+error.message);return}router.replace('/admin');router.refresh()}
 async function firstAdmin(){if(!email||password.length<8){setMsg('E-posta girin ve en az 8 karakterli parola belirleyin.');return}setBusy(true);setMsg('');const {data,error}=await supabase.auth.signUp({email,password});setBusy(false);if(error){setMsg('Kayıt başarısız: '+error.message);return}if(data.session){router.replace('/admin');router.refresh()}else setMsg('Hesap oluşturuldu. E-posta doğrulaması açıksa gelen bağlantıyı onaylayıp giriş yapın.')}
 return <main className="login-wrap"><form className="login-card" onSubmit={submit}><div className="brand-dark">VIVATECH ADMIN</div><h1>Yönetim Paneli</h1><p className="muted">Yetkili hesabınızla giriş yapın.</p><label>E-posta<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label><label>Parola<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></label>{msg&&<div className="notice">{msg}</div>}<button className="button" disabled={busy}>{busy?'Bekleyin…':'Giriş Yap'}</button><button className="button secondary" type="button" disabled={busy} onClick={firstAdmin}>İlk Yönetici Hesabını Oluştur</button><small className="muted">Bu düğme yalnızca sistemde henüz yönetici yokken ilk hesabı yönetici yapar.</small></form></main>
}
