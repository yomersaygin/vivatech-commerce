'use client';

import { DragEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

type Option = { id: string; name: string };
type ExistingImage = { id: string; image_url: string; alt_text: string | null; sort_order: number; is_primary: boolean };
type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  barcode: string | null;
  description: string | null;
  price: number | string;
  compare_at_price: number | string | null;
  stock_quantity: number;
  category_id: string | null;
  brand_id: string | null;
  seo_title: string | null;
  seo_description: string | null;
  is_active: boolean;
};

type PendingImage = { id: string; file: File; preview: string };

function slugify(value: string) {
  return value
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function moveItem<T>(items: T[], from: number, to: number) {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function cleanText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

export default function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const isEdit = Boolean(productId);
  const [categories, setCategories] = useState<Option[]>([]);
  const [brands, setBrands] = useState<Option[]>([]);
  const [images, setImages] = useState<ExistingImage[]>([]);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [message, setMessage] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiFeatures, setAiFeatures] = useState('');
  const [form, setForm] = useState({
    name: '', slug: '', sku: '', barcode: '', description: '', price: '', compare_at_price: '', stock_quantity: '0',
    category_id: '', brand_id: '', seo_title: '', seo_description: '', is_active: true,
  });

  const title = isEdit ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle';
  const canSave = useMemo(() => form.name.trim().length >= 2 && Number(form.price) >= 0 && Number(form.stock_quantity) >= 0, [form]);
  const descriptionChars = form.description.length;
  const seoTitleChars = form.seo_title.length;
  const seoDescriptionChars = form.seo_description.length;

  useEffect(() => {
    let active = true;
    (async () => {
      const [{ data: c }, { data: b }] = await Promise.all([
        supabase.from('categories').select('id,name').eq('is_active', true).order('name'),
        supabase.from('brands').select('id,name').eq('is_active', true).order('name'),
      ]);
      if (!active) return;
      setCategories(c ?? []); setBrands(b ?? []);

      if (productId) {
        const { data, error } = await supabase.from('products').select('*').eq('id', productId).single();
        if (error || !data) { setMessage('Ürün yüklenemedi: ' + (error?.message ?? 'Kayıt bulunamadı')); setLoading(false); return; }
        const p = data as Product;
        setForm({
          name: p.name ?? '', slug: p.slug ?? '', sku: p.sku ?? '', barcode: p.barcode ?? '', description: p.description ?? '',
          price: String(p.price ?? ''), compare_at_price: p.compare_at_price == null ? '' : String(p.compare_at_price),
          stock_quantity: String(p.stock_quantity ?? 0), category_id: p.category_id ?? '', brand_id: p.brand_id ?? '',
          seo_title: p.seo_title ?? '', seo_description: p.seo_description ?? '', is_active: Boolean(p.is_active),
        });
        const { data: imgs } = await supabase.from('product_images').select('id,image_url,alt_text,sort_order,is_primary').eq('product_id', productId).order('sort_order');
        setImages((imgs ?? []) as ExistingImage[]);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
      pendingImages.forEach(item => URL.revokeObjectURL(item.preview));
    };
    // pending image URLs are intentionally cleaned when the component is destroyed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) { setForm(prev => ({ ...prev, [key]: value })); }

  function addFiles(list: FileList | File[]) {
    const incoming = Array.from(list);
    const valid = incoming.filter(file => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) && file.size <= 10 * 1024 * 1024);
    const invalidCount = incoming.length - valid.length;
    setPendingImages(prev => [
      ...prev,
      ...valid.map(file => ({ id: crypto.randomUUID(), file, preview: URL.createObjectURL(file) })),
    ]);
    if (invalidCount) setMessage(`${invalidCount} görsel atlandı. Yalnızca JPEG, PNG, WebP ve dosya başına en fazla 10 MB kabul edilir.`);
  }

  function removePending(id: string) {
    setPendingImages(prev => {
      const target = prev.find(x => x.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter(x => x.id !== id);
    });
  }

  async function normalizeImageOrder(nextImages: ExistingImage[]) {
    if (!productId) return;
    setImageBusy(true);
    try {
      for (let index = 0; index < nextImages.length; index += 1) {
        const image = nextImages[index];
        const { error } = await supabase.from('product_images').update({ sort_order: index }).eq('id', image.id);
        if (error) throw error;
      }
      setImages(nextImages.map((img, index) => ({ ...img, sort_order: index })));
      setMessage('Görsel sırası kaydedildi.');
    } catch (err) {
      setMessage('Görsel sırası kaydedilemedi: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setImageBusy(false);
    }
  }

  async function setPrimaryImage(imageId: string) {
    if (!productId) return;
    setImageBusy(true); setMessage('');
    try {
      const { error: clearError } = await supabase.from('product_images').update({ is_primary: false }).eq('product_id', productId);
      if (clearError) throw clearError;
      const { error: primaryError } = await supabase.from('product_images').update({ is_primary: true }).eq('id', imageId).eq('product_id', productId);
      if (primaryError) throw primaryError;
      setImages(prev => prev.map(img => ({ ...img, is_primary: img.id === imageId })));
      setMessage('Ana görsel güncellendi.');
    } catch (err) {
      setMessage('Ana görsel değiştirilemedi: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setImageBusy(false);
    }
  }

  async function uploadImages(id: string, productName: string) {
    if (!pendingImages.length) return;
    let order = images.length;
    const hasPrimary = images.some(img => img.is_primary);
    for (let index = 0; index < pendingImages.length; index += 1) {
      const pending = pendingImages[index];
      const file = pending.file;
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${id}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(path, file, { upsert: false, contentType: file.type });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
      const { error: rowError } = await supabase.from('product_images').insert({
        product_id: id,
        image_url: urlData.publicUrl,
        alt_text: productName,
        sort_order: order,
        is_primary: !hasPrimary && index === 0,
      });
      if (rowError) throw rowError;
      order += 1;
    }
  }

  function insertDescription(prefix: string, suffix = '') {
    const textarea = descriptionRef.current;
    const current = form.description;
    const start = textarea?.selectionStart ?? current.length;
    const end = textarea?.selectionEnd ?? current.length;
    const selected = current.slice(start, end);
    const insertion = `${prefix}${selected}${suffix}`;
    set('description', current.slice(0, start) + insertion + current.slice(end));
    requestAnimationFrame(() => {
      textarea?.focus();
      const cursor = start + insertion.length;
      textarea?.setSelectionRange(cursor, cursor);
    });
  }

  function addFeatureTemplate() {
    const template = `\nÖne Çıkan Özellikler\n• \n• \n• \n\nKullanım Alanları\n• \n\nPaket İçeriği\n• \n`;
    set('description', (form.description.trimEnd() + template).trimStart());
  }

  function generateSeoDraft() {
    const brand = brands.find(x => x.id === form.brand_id)?.name ?? '';
    const category = categories.find(x => x.id === form.category_id)?.name ?? '';
    const titleParts = [brand, form.name].filter(Boolean);
    const seoTitle = cleanText(titleParts.join(' ')).slice(0, 60);
    const source = cleanText(form.description || `${form.name} ${category} ürününü Vivatech güvencesiyle inceleyin.`);
    setForm(prev => ({
      ...prev,
      seo_title: prev.seo_title || seoTitle,
      seo_description: prev.seo_description || source.slice(0, 155),
    }));
  }


  async function generateAiCopy() {
    if (!form.name.trim()) { setMessage('Yapay zekâ metni için önce ürün adını girin.'); return; }
    setAiBusy(true); setMessage('');
    try {
      const brand = brands.find(x => x.id === form.brand_id)?.name ?? '';
      const category = categories.find(x => x.id === form.category_id)?.name ?? '';
      const features = aiFeatures.split(/\n|,/).map(x => x.trim()).filter(Boolean);
      const { data, error } = await supabase.functions.invoke('generate-product-copy', {
        body: { name: form.name, brand, category, features, current_description: form.description },
      });
      if (error) throw error;
      if (!data?.description) throw new Error('Metin üretilemedi.');
      setForm(prev => ({
        ...prev,
        description: data.description,
        seo_title: data.seo_title || prev.seo_title,
        seo_description: data.seo_description || prev.seo_description,
      }));
      setMessage(data.source === 'ai' ? 'Yapay zekâ açıklaması ve SEO metni oluşturuldu.' : 'Ücretsiz yerel taslak oluşturuldu. AI anahtarı eklenirse yapay zekâ modeli kullanılacak.');
    } catch (err) {
      setMessage('Yapay zekâ metni oluşturulamadı: ' + (err instanceof Error ? err.message : String(err)));
    } finally { setAiBusy(false); }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!canSave) { setMessage('Ürün adı, fiyat ve stok alanlarını kontrol edin.'); return; }
    setBusy(true); setMessage('');
    try {
      const payload = {
        name: form.name.trim(), slug: (form.slug.trim() || slugify(form.name)), sku: form.sku.trim() || null, barcode: form.barcode.trim() || null,
        description: form.description.trim() || null, price: Number(form.price), compare_at_price: form.compare_at_price === '' ? null : Number(form.compare_at_price),
        stock_quantity: Number(form.stock_quantity), category_id: form.category_id || null, brand_id: form.brand_id || null,
        seo_title: form.seo_title.trim() || null, seo_description: form.seo_description.trim() || null, is_active: form.is_active,
      };
      let id = productId;
      if (isEdit && productId) {
        const { error } = await supabase.from('products').update(payload).eq('id', productId); if (error) throw error;
      } else {
        const { data, error } = await supabase.from('products').insert(payload).select('id').single(); if (error) throw error; id = data.id;
      }
      if (!id) throw new Error('Ürün kimliği oluşturulamadı.');
      await uploadImages(id, payload.name);
      pendingImages.forEach(item => URL.revokeObjectURL(item.preview));
      setPendingImages([]);
      setMessage('Ürün başarıyla kaydedildi.');
      router.push('/admin/products'); router.refresh();
    } catch (err) {
      setMessage('Kaydetme hatası: ' + (err instanceof Error ? err.message : String(err)));
    } finally { setBusy(false); }
  }

  async function removeImage(image: ExistingImage) {
    if (!confirm('Bu ürün görseli silinsin mi?')) return;
    setImageBusy(true); setMessage('');
    try {
      const marker = '/storage/v1/object/public/product-images/';
      const pos = image.image_url.indexOf(marker);
      if (pos >= 0) {
        const path = decodeURIComponent(image.image_url.slice(pos + marker.length));
        const { error } = await supabase.storage.from('product-images').remove([path]); if (error) throw error;
      }
      const { error } = await supabase.from('product_images').delete().eq('id', image.id); if (error) throw error;
      const remaining = images.filter(x => x.id !== image.id);
      if (image.is_primary && remaining.length && productId) {
        const replacement = remaining[0];
        const { error: primaryError } = await supabase.from('product_images').update({ is_primary: true }).eq('id', replacement.id).eq('product_id', productId);
        if (primaryError) throw primaryError;
        replacement.is_primary = true;
      }
      await normalizeImageOrder(remaining);
      setMessage('Görsel silindi.');
    } catch (err) { setMessage('Görsel silinemedi: ' + (err instanceof Error ? err.message : String(err))); }
    finally { setImageBusy(false); }
  }

  function onImageDragStart(index: number) { setDragIndex(index); }
  async function onImageDrop(event: DragEvent<HTMLDivElement>, targetIndex: number) {
    event.preventDefault();
    if (dragIndex == null || dragIndex === targetIndex) { setDragIndex(null); return; }
    const next = moveItem(images, dragIndex, targetIndex);
    setDragIndex(null);
    await normalizeImageOrder(next);
  }

  if (loading) return <div className="card">Ürün yükleniyor…</div>;

  return <>
    <div className="page-head"><div><h1>{title}</h1><p className="muted">Ürün, stok, fiyat, kategori, marka, açıklama ve görselleri tek ekrandan yönetin.</p></div><a className="button secondary" href="/admin/products">Listeye Dön</a></div>
    <form className="product-form" onSubmit={submit}>
      <section className="form-card"><h2>Temel Bilgiler</h2><div className="form-grid two">
        <label>Ürün Adı<input value={form.name} onChange={e=>{set('name',e.target.value); if(!isEdit && !form.slug) set('slug',slugify(e.target.value))}} required /></label>
        <label>URL / Slug<input value={form.slug} onChange={e=>set('slug',e.target.value)} placeholder="otomatik-olusturulur" /></label>
        <label>Ürün Kodu / SKU<input value={form.sku} onChange={e=>set('sku',e.target.value)} /></label>
        <label>Barkod<input value={form.barcode} onChange={e=>set('barcode',e.target.value)} /></label>
        <label>Marka<select value={form.brand_id} onChange={e=>set('brand_id',e.target.value)}><option value="">Seçiniz</option>{brands.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
        <label>Kategori<select value={form.category_id} onChange={e=>set('category_id',e.target.value)}><option value="">Seçiniz</option>{categories.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
      </div></section>

      <section className="form-card"><div className="section-row"><div><h2>Ürün Açıklaması</h2><p className="muted">Satış metnini daha hızlı hazırlamak için biçimlendirme araçlarını kullanın.</p></div><span className="char-count">{descriptionChars} karakter</span></div>
        <div className="ai-copy-box">
          <div><strong>Yapay Zekâ ile Satış Metni</strong><p className="muted">Sadece bildiğiniz özellikleri yazın. Sistem verilmemiş teknik özellikleri uydurmaması için sınırlandırılmıştır.</p></div>
          <textarea rows={4} value={aiFeatures} onChange={e=>setAiFeatures(e.target.value)} placeholder="Örn: 9MP, 3 lens, 4G SIM, çift solar panel, IP66, çift yönlü ses" />
          <button type="button" className="button" disabled={aiBusy} onClick={generateAiCopy}>{aiBusy?'Metin hazırlanıyor…':'AI Açıklama + SEO Oluştur'}</button>
        </div>
        <div className="editor-toolbar">
          <button type="button" onClick={()=>insertDescription('\nBAŞLIK\n')}>Başlık</button>
          <button type="button" onClick={()=>insertDescription('\n• ')}>• Madde</button>
          <button type="button" onClick={()=>insertDescription('\n1. ')}>1. Liste</button>
          <button type="button" onClick={()=>insertDescription('✓ ')}>✓ Vurgu</button>
          <button type="button" onClick={addFeatureTemplate}>Özellik Şablonu</button>
        </div>
        <textarea ref={descriptionRef} className="description-editor" rows={14} value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Ürünün faydalarını, teknik özelliklerini ve kullanım alanlarını yazın…" />
      </section>

      <section className="form-card"><h2>Fiyat ve Stok</h2><div className="form-grid three">
        <label>Satış Fiyatı (₺)<input type="number" min="0" step="0.01" value={form.price} onChange={e=>set('price',e.target.value)} required /></label>
        <label>İndirim Öncesi Fiyat<input type="number" min="0" step="0.01" value={form.compare_at_price} onChange={e=>set('compare_at_price',e.target.value)} /></label>
        <label>Stok<input type="number" min="0" step="1" value={form.stock_quantity} onChange={e=>set('stock_quantity',e.target.value)} required /></label>
      </div><label className="check"><input type="checkbox" checked={form.is_active} onChange={e=>set('is_active',e.target.checked)} /> Ürün satışta / aktif</label></section>

      <section className="form-card"><div className="section-row"><div><h2>Ürün Görselleri</h2><p className="muted">Birden fazla görsel yükleyin. Mevcut görselleri sürükleyerek sıralayın ve ana görseli tek tıkla seçin.</p></div>{imageBusy && <span className="badge">Kaydediliyor…</span>}</div>
        {images.length>0 && <div className="image-manager-grid">{images.map((img,index)=><div className={`image-manager-item ${img.is_primary?'primary':''}`} key={img.id} draggable={!imageBusy} onDragStart={()=>onImageDragStart(index)} onDragOver={e=>e.preventDefault()} onDrop={e=>onImageDrop(e,index)}>
          <div className="image-manager-media"><Image src={img.image_url} alt={img.alt_text ?? form.name} width={420} height={420} />{img.is_primary && <span className="primary-pill">ANA GÖRSEL</span>}<span className="sort-pill">#{index+1}</span></div>
          <div className="image-manager-actions"><button type="button" className="link-button" disabled={imageBusy || img.is_primary} onClick={()=>setPrimaryImage(img.id)}>{img.is_primary?'Ana Görsel':'Ana Görsel Yap'}</button><button type="button" className="danger-link" disabled={imageBusy} onClick={()=>removeImage(img)}>Sil</button></div>
          <small className="muted">↕ Sıralamak için sürükleyin</small>
        </div>)}</div>}

        <label className="upload-zone" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault(); addFiles(e.dataTransfer.files)}}>
          <strong>Görselleri buraya sürükleyin</strong>
          <span>veya bilgisayardan seçin · JPEG / PNG / WebP · Maksimum 10 MB</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e=>{if(e.target.files) addFiles(e.target.files); e.target.value='';}} />
        </label>

        {pendingImages.length>0 && <><div className="section-row"><strong>Yükleme Sırası</strong><span className="muted">{pendingImages.length} yeni görsel</span></div><div className="pending-image-grid">{pendingImages.map((item,index)=><div className="pending-image" key={item.id}><Image src={item.preview} alt={item.file.name} width={160} height={160} unoptimized /><span>{index+1}</span><small title={item.file.name}>{item.file.name}</small><button type="button" onClick={()=>removePending(item.id)}>×</button></div>)}</div></>}
      </section>

      <section className="form-card"><div className="section-row"><div><h2>SEO</h2><p className="muted">Google sonuçlarında görünecek başlık ve açıklama.</p></div><button type="button" className="button secondary compact" onClick={generateSeoDraft}>SEO Taslağı Oluştur</button></div>
        <div className="form-grid two"><label>SEO Başlığı<input value={form.seo_title} onChange={e=>set('seo_title',e.target.value)} /><small className={seoTitleChars>60?'limit-warn':'muted'}>{seoTitleChars}/60 karakter</small></label><label>Meta Açıklama<textarea rows={4} value={form.seo_description} onChange={e=>set('seo_description',e.target.value)} /><small className={seoDescriptionChars>160?'limit-warn':'muted'}>{seoDescriptionChars}/160 karakter</small></label></div>
      </section>
      {message && <div className={message.includes('başarıyla')||message.includes('güncellendi')||message.includes('kaydedildi')||message.includes('silindi')?'ok':'error'}>{message}</div>}
      <div className="form-actions"><button className="button" disabled={busy || imageBusy || !canSave}>{busy?'Kaydediliyor…':'Ürünü Kaydet'}</button><a className="button secondary" href="/admin/products">İptal</a></div>
    </form>
  </>;
}
