'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import AdminFeedback from '../../AdminFeedback';

type Category = { id:string; name:string; slug:string; parent_id:string|null; image_url:string|null; seo_title:string|null; seo_description:string|null; is_active:boolean };
type Feedback = { tone:'success'|'error'; message:string };
function slugify(value:string){return value.toLocaleLowerCase('tr-TR').replace(/ı/g,'i').replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ö/g,'o').replace(/ç/g,'c').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');}

export default function CategoryManager(){
  const [items,setItems]=useState<Category[]>([]); const [editing,setEditing]=useState<string|null>(null); const [busy,setBusy]=useState(false); const [feedback,setFeedback]=useState<Feedback|null>(null);
  const [usage,setUsage]=useState<Record<string,number>>({}); const [search,setSearch]=useState(''); const [status,setStatus]=useState('all');
  const [form,setForm]=useState({name:'',slug:'',parent_id:'',image_url:'',seo_title:'',seo_description:'',is_active:true});
  const visibleItems=useMemo(()=>{const term=search.trim().toLocaleLowerCase('tr-TR');return items.filter(x=>(!term||x.name.toLocaleLowerCase('tr-TR').includes(term)||x.slug.includes(term))&&(status==='all'||(status==='active'?x.is_active:!x.is_active)))},[items,search,status]);
  async function load(){try{const [{data,error},{data:products,error:usageError}]=await Promise.all([supabase.from('categories').select('id,name,slug,parent_id,image_url,seo_title,seo_description,is_active').order('name'),supabase.from('products').select('category_id')]);if(error||usageError){setFeedback({tone:'error',message:'Kategori listesi yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.'});return}setItems((data??[]) as Category[]);const counts:Record<string,number>={};for(const row of products??[]){if(row.category_id)counts[row.category_id]=(counts[row.category_id]??0)+1}setUsage(counts)}catch{setFeedback({tone:'error',message:'Kategoriler yüklenirken beklenmeyen bir hata oluştu.'})}}
  useEffect(()=>{load()},[]);
  function reset(){setEditing(null);setForm({name:'',slug:'',parent_id:'',image_url:'',seo_title:'',seo_description:'',is_active:true})}
  function edit(x:Category){setEditing(x.id);setForm({name:x.name,slug:x.slug,parent_id:x.parent_id??'',image_url:x.image_url??'',seo_title:x.seo_title??'',seo_description:x.seo_description??'',is_active:x.is_active});window.scrollTo({top:0,behavior:'smooth'})}
  async function submit(e:FormEvent){e.preventDefault();setBusy(true);setFeedback(null);try{const wasEditing=Boolean(editing);const payload={name:form.name.trim(),slug:slugify(form.slug||form.name),parent_id:form.parent_id||null,image_url:form.image_url.trim()||null,seo_title:form.seo_title.trim()||null,seo_description:form.seo_description.trim()||null,is_active:form.is_active};const q=editing?supabase.from('categories').update(payload).eq('id',editing):supabase.from('categories').insert(payload);const {error}=await q;if(error){setFeedback({tone:'error',message:'Kategori kaydedilemedi. Ad, slug ve üst kategori alanlarını kontrol edin.'});return}reset();await load();setFeedback({tone:'success',message:wasEditing?'Kategori güncellendi.':'Kategori eklendi.'})}catch{setFeedback({tone:'error',message:'Kategori kaydedilirken beklenmeyen bir hata oluştu.'})}finally{setBusy(false)}}
  async function remove(x:Category){if(!confirm(`${x.name} kategorisi silinsin mi?`))return;setBusy(true);setFeedback(null);try{const {error}=await supabase.from('categories').delete().eq('id',x.id);if(error){setFeedback({tone:'error',message:'Kategori silinemedi. Kategoriye bağlı ürün veya alt kategori olabilir.'});return}await load();setFeedback({tone:'success',message:'Kategori silindi.'})}catch{setFeedback({tone:'error',message:'Kategori silinirken beklenmeyen bir hata oluştu.'})}finally{setBusy(false)}}
  return <>
    <div className="page-head"><div><h1>Kategoriler</h1><p className="muted">Kategori ekleyin, düzenleyin, alt kategori bağlayın ve SEO bilgilerini yönetin.</p></div></div>
    <form className="form-card" onSubmit={submit}><h2>{editing?'Kategoriyi Düzenle':'Yeni Kategori'}</h2><div className="form-grid two">
      <label>Kategori Adı<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value,slug:editing?form.slug:slugify(e.target.value)})}/></label>
      <label>Slug<input value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})}/></label>
      <label>Üst Kategori<select value={form.parent_id} onChange={e=>setForm({...form,parent_id:e.target.value})}><option value="">Ana kategori</option>{items.filter(x=>x.id!==editing).map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
      <label>Görsel URL<input value={form.image_url} onChange={e=>setForm({...form,image_url:e.target.value})}/></label>
      <label>SEO Başlığı<input value={form.seo_title} onChange={e=>setForm({...form,seo_title:e.target.value})}/></label>
      <label>Meta Açıklama<textarea rows={3} value={form.seo_description} onChange={e=>setForm({...form,seo_description:e.target.value})}/></label>
    </div><label className="check"><input type="checkbox" checked={form.is_active} onChange={e=>setForm({...form,is_active:e.target.checked})}/> Aktif</label>
    <div className="form-actions"><button className="button" disabled={busy}>{busy?'Kaydediliyor…':editing?'Güncelle':'Kategori Ekle'}</button>{editing&&<button className="button secondary" type="button" onClick={reset}>Vazgeç</button>}</div></form>
    {feedback&&<AdminFeedback {...feedback}/>}
    <div className="admin-list-tools"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Kategori adı veya slug ara…"/><select value={status} onChange={e=>setStatus(e.target.value)}><option value="all">Tüm durumlar</option><option value="active">Aktif</option><option value="passive">Pasif</option></select><span>{visibleItems.length} / {items.length} kategori</span></div>
    <table className="table"><thead><tr><th>Ad</th><th>Slug</th><th>Üst Kategori</th><th>Ürün</th><th>Durum</th><th>İşlem</th></tr></thead><tbody>{visibleItems.map(x=><tr key={x.id}><td>{x.name}</td><td>{x.slug}</td><td>{items.find(p=>p.id===x.parent_id)?.name??'—'}</td><td>{usage[x.id]??0}</td><td><span className={x.is_active?'badge active':'badge'}>{x.is_active?'Aktif':'Pasif'}</span></td><td><button className="link-button" onClick={()=>edit(x)}>Düzenle</button> <button className="danger-link" onClick={()=>remove(x)}>Sil</button></td></tr>)}</tbody></table>{visibleItems.length===0&&<div className="empty">Eşleşen kategori bulunamadı.</div>}
  </>
}
