'use client';
import { useEffect } from 'react'; import { useRouter } from 'next/navigation'; import { supabase } from '@/lib/supabase';
export default function Logout(){const router=useRouter();useEffect(()=>{supabase.auth.signOut().finally(()=>router.replace('/admin/login'))},[router]);return <main className="login-wrap"><div className="login-card">Çıkış yapılıyor…</div></main>}
