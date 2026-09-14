'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import AdminFeedback from '../AdminFeedback';

type Row = { id:string; name:string; sku:string|null; price:number|string; stock_quantity:number; is_active:boolean; category_id:string|null; brand_id:string|null };
type Named = { id:string; name:string };
type Feedback = { tone:'success'|'error'; message:string };

export default function Products() {
  const [rows,setRows]=useState<Row[]>([]);
  const [cats,setCats]=useState<Record<string,string>>({});
  const [brands,setBrands]=useState<Record<string,string>>({});
  const [feedback,setFeedback]=useState<Feedback|null>(null);
  const [loading,setLoading]=useState(true);
  const [deletingId,setDeletingId]=useState<string|null>(null);
  const [search,setSearch]=useState('');
  const [status,setStatus]=useState('all');
  const [stock,setStock]=useState('all');
  const [category,setCategory]=useState('');
  const [brand,setBrand]=useState('');

  const filteredRows=useMemo(()=>{const term=search.trim().toLocaleLowerCase('tr-TR');return rows.filter(row=>{const matchesSearch=!term||row.name.toLocaleLowerCase('tr-TR').includes(term)||(row.sku??'').toLocaleLowerCase('tr-TR').includes(term);const matchesStatus=status==='all'||(status==='active'?row.is_active:!row.is_active);const matchesStock=stock==='all'||(stock==='out'?row.stock_quantity<=0:stock==='low'?row.stock_quantity>0&&row.stock_quantity<=5:row.stock_quantity>5);return matchesSearch&&matchesStatus&&matchesStock&&(!category||row.category_id===category)&&(!brand||row.brand_id===brand)})},[rows,search,status,stock,category,brand]);
  const hasFilters=Boolean(search||status!=='all'||stock!=='all'||category||brand);

  function clearFilters(){setSearch('');setStatus('all');setStock('all');setCategory('');setBrand('')}

  async function load(){
    setLoading(true);
    try {
      const [{data,error},{data:c,error:categoryError},{data:b,error:brandError}]=await Promise.all([
        supabase.from('products').select('id,name,sku,price,stock_quantity,is_active,category_id,brand_id').order('created_at',{ascending:false}),
        supabase.from('categories').select('id,name'),
        supabase.from('brands').select('id,name'),
      ]);
      if(error||categoryError||brandError){setFeedback({tone:'error',message:'Ürün listesi yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.'});return}
      setRows((data??[]) as Row[]);
      setCats(Object.fromEntries(((c??[]) as Named[]).map(x=>[x.id,x.name])));
      setBrands(Object.fromEntries(((b??[]) as Named[]).map(x=>[x.id,x.name])));
    } catch {
      setFeedback({tone:'error',message:'Ürün listesi yüklenirken beklenmeyen bir hata oluştu.'});
    } finally {
      setLoading(false);
    }
  }

  useEffect(()=>{void load()},[]);

  async function remove(row:Row){
    if(!confirm(`“${row.name}” ürünü silinsin mi?`))return;
    setDeletingId(row.id);
    setFeedback(null);
    try {
      const {data:imgs,error:imageLoadError}=await supabase.from('product_images').select('id,image_url').eq('product_id',row.id);
      if(imageLoadError){setFeedback({tone:'error',message:'Ürün görselleri kontrol edilemedi. Ürün silinmedi.'});return}
      if(imgs?.length){
        const marker='/storage/v1/object/public/product-images/';
        const paths=imgs.map(x=>{const pos=x.image_url.indexOf(marker);return pos>=0?decodeURIComponent(x.image_url.slice(pos+marker.length)):null}).filter(Boolean) as string[];
        if(paths.length){const {error:storageError}=await supabase.storage.from('product-images').remove(paths);if(storageError){setFeedback({tone:'error',message:'Ürün görselleri depolamadan silinemedi. Ürün silinmedi.'});return}}
        const {error:imageDeleteError}=await supabase.from('product_images').delete().eq('product_id',row.id);
        if(imageDeleteError){setFeedback({tone:'error',message:'Ürün görsel kayıtları silinemedi. Ürün silinmedi.'});return}
      }
      const {error}=await supabase.from('products').delete().eq('id',row.id);
      if(error){setFeedback({tone:'error',message:'Ürün silinemedi. Ürünün bağlı sipariş kaydı olabilir.'});return}
      setFeedback({tone:'success',message:'Ürün silindi.'});
      await load();
    } catch {
      setFeedback({tone:'error',message:'Ürün silinirken beklenmeyen bir hata oluştu.'});
    } finally {
      setDeletingId(null);
    }
  }

  return <>
    <div className="page-head"><div><h1>Ürünler</h1><p className="muted">Ürün, fiyat ve stok kayıtlarını yönetin.</p></div><a className="button" href="/admin/products/new">+ Yeni Ürün</a></div>
    {feedback&&<AdminFeedback {...feedback}/>}
    <div aria-busy={loading}>
      {loading?<div className="card" role="status">Yükleniyor…</div>:<>
        <div className="admin-filters"><label>Ürün veya SKU<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Ara…" /></label><label>Durum<select value={status} onChange={e=>setStatus(e.target.value)}><option value="all">Tümü</option><option value="active">Aktif</option><option value="passive">Pasif</option></select></label><label>Stok<select value={stock} onChange={e=>setStock(e.target.value)}><option value="all">Tümü</option><option value="out">Tükendi</option><option value="low">Kritik (1–5)</option><option value="available">Stokta (6+)</option></select></label><label>Kategori<select value={category} onChange={e=>setCategory(e.target.value)}><option value="">Tümü</option>{Object.entries(cats).map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label><label>Marka<select value={brand} onChange={e=>setBrand(e.target.value)}><option value="">Tümü</option>{Object.entries(brands).map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label>{hasFilters&&<button type="button" className="button secondary compact" onClick={clearFilters}>Filtreleri Temizle</button>}</div>
        <div className="result-count">{filteredRows.length} / {rows.length} ürün gösteriliyor</div>
        <div className="table-wrap"><table className="table"><thead><tr><th>Ürün</th><th>SKU</th><th>Marka</th><th>Kategori</th><th>Fiyat</th><th>Stok</th><th>Durum</th><th>İşlemler</th></tr></thead><tbody>{filteredRows.map(x=><tr key={x.id}><td><b>{x.name}</b></td><td>{x.sku||'—'}</td><td>{x.brand_id?brands[x.brand_id]||'—':'—'}</td><td>{x.category_id?cats[x.category_id]||'—':'—'}</td><td>{Number(x.price).toLocaleString('tr-TR',{minimumFractionDigits:2})} ₺</td><td><span className={x.stock_quantity<=0?'badge danger':x.stock_quantity<=5?'badge warning':''}>{x.stock_quantity}</span></td><td><span className={x.is_active?'badge active':'badge'}>{x.is_active?'Aktif':'Pasif'}</span></td><td><div className="row-actions"><a href={`/admin/products/${x.id}/edit`}>Düzenle</a><button disabled={deletingId!==null} onClick={()=>remove(x)}>{deletingId===x.id?'Siliniyor…':'Sil'}</button></div></td></tr>)}</tbody></table>{rows.length===0?<div className="empty">Henüz ürün yok.</div>:filteredRows.length===0&&<div className="empty">Filtrelerle eşleşen ürün bulunamadı.</div>}</div>
      </>}
    </div>
  </>;
}
