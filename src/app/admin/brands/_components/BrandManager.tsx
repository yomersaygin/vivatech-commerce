'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import AdminFeedback from '../../AdminFeedback';

type Brand={id:string;name:string;slug:string;logo_url:string|null;is_active:boolean};
type Feedback={tone:'success'|'error';message:string};
function slugify(value:string){return value.toLocaleLowerCase('tr-TR').replace(/ı/g,'i').replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ö/g,'o').replace(/ç/g,'c').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')}

export default function BrandManager(){
  const [items,setItems]=useState<Brand[]>([]);
  const [editing,setEditing]=useState<string|null>(null);
  const [busy,setBusy]=useState(false);
  const [loading,setLoading]=useState(true);
  const [feedback,setFeedback]=useState<Feedback|null>(null);
  const [usage,setUsage]=useState<Record<string,number>>({});
  const [search,setSearch]=useState('');
  const [status,setStatus]=useState('all');
  const [form,setForm]=useState({name:'',slug:'',logo_url:'',is_active:true});
  const visibleItems=useMemo(()=>{const term=search.trim().toLocaleLowerCase('tr-TR');return items.filter(x=>(!term||x.name.toLocaleLowerCase('tr-TR').includes(term)||x.slug.includes(term))&&(status==='all'||(status==='active'?x.is_active:!x.is_active)))},[items,search,status]);

  async function load(){setLoading(true);try{const [{data,error},{data:products,error:usageError}]=await Promise.all([supabase.from('brands').select('id,name,slug,logo_url,is_active').order('name'),supabase.from('products').select('brand_id')]);if(error||usageError){setFeedback({tone:'error',message:'Marka listesi yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.'});return}setItems((data??[]) as Brand[]);const counts:Record<string,number>={};for(const row of products??[]){if(row.brand_id)counts[row.brand_id]=(counts[row.brand_id]??0)+1}setUsage(counts)}catch{setFeedback({tone:'error',message:'Markalar yüklenirken beklenmeyen bir hata oluştu.'})}finally{setLoading(false)}}
  useEffect(()=>{void load()},[]);
  function reset(){setEditing(null);setForm({name:'',slug:'',logo_url:'',is_active:true})}
  function edit(x:Brand){setEditing(x.id);setForm({name:x.name,slug:x.slug,logo_url:x.logo_url??'',is_active:x.is_active});window.scrollTo({top:0,behavior:'smooth'})}
  async function submit(e:FormEvent){e.preventDefault();setBusy(true);setFeedback(null);try{const wasEditing=Boolean(editing);const payload={name:form.name.trim(),slug:slugify(form.slug||form.name),logo_url:form.logo_url.trim()||null,is_active:form.is_active};const {error}=editing?await supabase.from('brands').update(payload).eq('id',editing):await supabase.from('brands').insert(payload);if(error){setFeedback({tone:'error',message:'Marka kaydedilemedi. Ad ve slug alanlarını kontrol edin.'});return}reset();await load();setFeedback({tone:'success',message:wasEditing?'Marka güncellendi.':'Marka eklendi.'})}catch{setFeedback({tone:'error',message:'Marka kaydedilirken beklenmeyen bir hata oluştu.'})}finally{setBusy(false)}}
  async function remove(x:Brand){if(!confirm(`${x.name} markası silinsin mi?`))return;setBusy(true);setFeedback(null);try{const {error}=await supabase.from('brands').delete().eq('id',x.id);if(error){setFeedback({tone:'error',message:'Marka silinemedi. Markaya bağlı ürün olabilir.'});return}await load();setFeedback({tone:'success',message:'Marka silindi.'})}catch{setFeedback({tone:'error',message:'Marka silinirken beklenmeyen bir hata oluştu.'})}finally{setBusy(false)}}

  return <><div className="page-head"><div><h1>Markalar</h1><p className="muted">Marka ekleyin, düzenleyin ve görünürlük durumunu yönetin.</p></div></div><form className="form-card" onSubmit={submit}><h2>{editing?'Markayı Düzenle':'Yeni Marka'}</h2><div className="form-grid two"><label>Marka Adı<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value,slug:editing?form.slug:slugify(e.target.value)})}/></label><label>Slug<input value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})}/></label><label>Logo URL<input value={form.logo_url} onChange={e=>setForm({...form,logo_url:e.target.value})}/></label></div><label className="check"><input type="checkbox" checked={form.is_active} onChange={e=>setForm({...form,is_active:e.target.checked})}/> Aktif</label><div className="form-actions"><button className="button" disabled={busy}>{busy?'Kaydediliyor…':editing?'Güncelle':'Marka Ekle'}</button>{editing&&<button className="button secondary" type="button" disabled={busy} onClick={reset}>Vazgeç</button>}</div></form>{feedback&&<AdminFeedback {...feedback}/>}<div className="admin-list-tools"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Marka adı veya slug ara…"/><select value={status} onChange={e=>setStatus(e.target.value)}><option value="all">Tüm durumlar</option><option value="active">Aktif</option><option value="passive">Pasif</option></select><span>{visibleItems.length} / {items.length} marka</span></div><div aria-busy={loading}>{loading?<div className="card" role="status">Markalar yükleniyor…</div>:<><table className="table"><thead><tr><th>Marka</th><th>Slug</th><th>Ürün</th><th>Durum</th><th>İşlem</th></tr></thead><tbody>{visibleItems.map(x=><tr key={x.id}><td>{x.name}</td><td>{x.slug}</td><td>{usage[x.id]??0}</td><td><span className={x.is_active?'badge active':'badge'}>{x.is_active?'Aktif':'Pasif'}</span></td><td><button className="link-button" disabled={busy} onClick={()=>edit(x)}>Düzenle</button> <button className="danger-link" disabled={busy} onClick={()=>remove(x)}>Sil</button></td></tr>)}</tbody></table>{visibleItems.length===0&&<div className="empty">Eşleşen marka bulunamadı.</div>}</>}</div></>;
}
