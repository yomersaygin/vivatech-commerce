import { supabase } from '@/lib/supabase';
export const dynamic='force-dynamic';
export default async function Admin(){
  const [products,categories,brands]=await Promise.all([
    supabase.from('products').select('*',{count:'exact',head:true}),
    supabase.from('categories').select('*',{count:'exact',head:true}),
    supabase.from('brands').select('*',{count:'exact',head:true})
  ]);
  const err=products.error||categories.error||brands.error;
  return <><h1>Dashboard</h1><p className="muted">Vivatech e-ticaret yönetim paneli temel sürümü.</p>{err&&<div className="error">Veri bağlantısı kurulamadı: {err.message}</div>}<div className="cards"><div className="card"><b>Ürünler</b><div>{products.count ?? '—'}</div></div><div className="card"><b>Kategoriler</b><div>{categories.count ?? '—'}</div></div><div className="card"><b>Markalar</b><div>{brands.count ?? '—'}</div></div></div></>
}
