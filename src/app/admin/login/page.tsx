'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AdminFeedback from '../AdminFeedback';

type Feedback={tone:'success'|'error';message:string};

export default function Login(){
 const router=useRouter(); const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [feedback,setFeedback]=useState<Feedback|null>(null); const [busy,setBusy]=useState(false);
 useEffect(()=>{supabase.auth.getUser().then(({data})=>{if(data.user) router.replace('/admin')})},[router]);
 async function submit(e:FormEvent){e.preventDefault();setBusy(true);setFeedback(null);try{const {error}=await supabase.auth.signInWithPassword({email,password});if(error){setFeedback({tone:'error',message:'Giriş başarısız. E-posta adresinizi ve parolanızı kontrol edin.'});return}router.replace('/admin');router.refresh()}catch{setFeedback({tone:'error',message:'Giriş sırasında beklenmeyen bir hata oluştu.'})}finally{setBusy(false)}}
 async function forgotPassword(){if(!email){setFeedback({tone:'error',message:'Önce yönetici e-posta adresinizi girin.'});return}setBusy(true);setFeedback(null);try{const redirectTo=`${window.location.origin}/account/reset-password?returnTo=admin`;const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo});if(error){setFeedback({tone:'error',message:'Şifre yenileme bağlantısı gönderilemedi. Lütfen tekrar deneyin.'});return}setFeedback({tone:'success',message:'Şifre yenileme bağlantısı e-posta adresinize gönderildi.'})}catch{setFeedback({tone:'error',message:'Şifre yenileme işlemi sırasında beklenmeyen bir hata oluştu.'})}finally{setBusy(false)}}
 async function firstAdmin(){if(!email||password.length<8){setFeedback({tone:'error',message:'E-posta girin ve en az 8 karakterli parola belirleyin.'});return}setBusy(true);setFeedback(null);try{const {data,error}=await supabase.auth.signUp({email,password});if(error){setFeedback({tone:'error',message:'Hesap oluşturulamadı. Bilgileri kontrol edip tekrar deneyin.'});return}if(data.session){router.replace('/admin');router.refresh()}else setFeedback({tone:'success',message:'Hesap oluşturuldu. E-posta doğrulaması açıksa gelen bağlantıyı onaylayıp giriş yapın.'})}catch{setFeedback({tone:'error',message:'Hesap oluşturulurken beklenmeyen bir hata oluştu.'})}finally{setBusy(false)}}
 return <main className="login-wrap"><form className="login-card" onSubmit={submit} aria-busy={busy}><div className="brand-dark">VIVATECH ADMIN</div><h1>Yönetim Paneli</h1><p className="muted">Yetkili hesabınızla giriş yapın.</p><label>E-posta<input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" required /></label><label>Parola<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required /></label>{feedback&&<AdminFeedback {...feedback}/>}<button className="button" disabled={busy}>{busy?'Bekleyin…':'Giriş Yap'}</button><button className="button secondary" type="button" disabled={busy} onClick={forgotPassword}>Şifremi Unuttum</button><button className="button secondary" type="button" disabled={busy} onClick={firstAdmin}>İlk Yönetici Hesabını Oluştur</button><small className="muted">Bu düğme yalnızca sistemde henüz yönetici yokken ilk hesabı yönetici yapar.</small></form></main>
}
