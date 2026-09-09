'use client';

import { FormEvent, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Category = { id:string; name:string; slug:string; parent_id:string|null; image_url:string|null; seo_title:string|null; seo_description:string|null; is_active:boolean };
function slugify(value:string){return value.toLocaleLowerCase('tr-TR').replace(/ı/g,'i').replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ö/g,'o').replace(/ç/g,'c').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');}

export default function CategoryManager(){
  const [items,setItems]=useState<Category[]>([]); const [editing,setEditing]=useState<string|null>(null); const [busy,setBusy]=useState(false); const [message,setMessage]=useState('');
  const [form,setForm]=useState({name:'',slug:'',parent_id:'',image_url:'',seo_title:'',seo_description:'',is_active:true});
  async function load(){const {data,error}=await supabase.from('categories').select('id,name,slug,parent_id,image_url,seo_title,seo_description,is_active').order('name'); if(error)setMessage(error.message); else setItems((data??[]) as Category[])}
  useEffect(()=>{load()},[]);
  function reset(){setEditing(null);setForm({name:'',slug:'',parent_id:'',image_url:'',seo_title:'',seo_description:'',is_active:true});setMessage('')}
  function edit(x:Category){setEditing(x.id);setForm({name:x.name,slug:x.slug,parent_id:x.parent_id??'',image_url:x.image_url??'',seo_title:x.seo_title??'',seo_description:x.seo_description??'',is_active:x.is_active});window.scrollTo({top:0,behavior:'smooth'})}
  async function submit(e:FormEvent){e.preventDefault();setBusy(true);setMessage('');try{const payload={name:form.name.trim(),slug:form.slug.trim()||slugify(form.name),parent_id:form.parent_id||null,image_url:form.image_url.trim()||null,seo_title:form.seo_title.trim()||null,seo_description:form.seo_description.trim()||null,is_active:form.is_active};const q=editing?supabase.from('categories').update(payload).eq('id',editing):supabase.from('categories').insert(payload);const {error}=await q;if(error)throw error;setMessage(editing?'Kategori güncellendi.':'Kategori eklendi.');reset();await load()}catch(err){setMessage('Hata: '+(err instanceof Error?err.message:String(err)))}finally{setBusy(false)}}
  async function remove(x:Category){if(!confirm(`${x.name} kategorisi silinsin mi?`))return;setBusy(true);setMessage('');try{const {error}=await supabase.from('categories').delete().eq('id',x.id);if(error)throw error;await load();setMessage('Kategori silindi.')}catch(err){setMessage('Silinemedi: '+(err instanceof Error?err.message:String(err)))}finally{setBusy(false)}}
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
    {message&&<div className={message.startsWith('Hata')||message.startsWith('Silinemedi')?'error':'ok'}>{message}</div>}
    <table className="table"><thead><tr><th>Ad</th><th>Slug</th><th>Üst Kategori</th><th>Durum</th><th>İşlem</th></tr></thead><tbody>{items.map(x=><tr key={x.id}><td>{x.name}</td><td>{x.slug}</td><td>{items.find(p=>p.id===x.parent_id)?.name??'—'}</td><td>{x.is_active?'Aktif':'Pasif'}</td><td><button className="link-button" onClick={()=>edit(x)}>Düzenle</button> <button className="danger-link" onClick={()=>remove(x)}>Sil</button></td></tr>)}</tbody></table>
  </>
}
