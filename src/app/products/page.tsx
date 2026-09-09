'use client';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { StoreHeader } from '@/components/StoreHeader';
import { supabase } from '@/lib/supabase';

type Category={id:string;name:string;slug:string};
type Brand={id:string;name:string;slug:string};
type Product={id:string;name:string;slug:string;price:number|string;compare_at_price:number|string|null;stock_quantity:number;category_id:string|null;brand_id:string|null;product_images:{image_url:string;is_primary:boolean}[]|null};
const money=(v:number|string)=>Number(v).toLocaleString('tr-TR',{style:'currency',currency:'TRY'});

function ProductsContent(){
 const searchParams=useSearchParams();
 const initialQ=searchParams.get('q')||''; const initialCategory=searchParams.get('category')||''; const initialBrand=searchParams.get('brand')||'';
 const [products,setProducts]=useState<Product[]>([]); const [categories,setCategories]=useState<Category[]>([]); const [brands,setBrands]=useState<Brand[]>([]);
 const [q,setQ]=useState(initialQ); const [category,setCategory]=useState(initialCategory); const [brand,setBrand]=useState(initialBrand); const [sort,setSort]=useState('newest'); const [loading,setLoading]=useState(true); const [error,setError]=useState('');
 useEffect(()=>{setQ(initialQ);setCategory(initialCategory);setBrand(initialBrand)},[initialQ,initialCategory,initialBrand]);
 useEffect(()=>{(async()=>{setLoading(true);setError('');const [{data:p,error:pe},{data:c,error:ce},{data:b,error:be}]=await Promise.all([
  supabase.from('products').select('id,name,slug,price,compare_at_price,stock_quantity,category_id,brand_id,product_images(image_url,is_primary)').eq('is_active',true).order('created_at',{ascending:false}),
  supabase.from('categories').select('id,name,slug').eq('is_active',true).order('name'),
  supabase.from('brands').select('id,name,slug').eq('is_active',true).order('name')
 ]); if(pe||ce||be)setError(pe?.message||ce?.message||be?.message||'Ürünler alınamadı.');setProducts((p??[]) as Product[]);setCategories((c??[]) as Category[]);setBrands((b??[]) as Brand[]);setLoading(false)})()},[]);
 const categoryId=categories.find(x=>x.slug===category)?.id; const brandId=brands.find(x=>x.slug===brand)?.id;
 const filtered=useMemo(()=>{let list=products.filter(p=>(!category||p.category_id===categoryId)&&(!brand||p.brand_id===brandId)&&(!q||p.name.toLocaleLowerCase('tr-TR').includes(q.trim().toLocaleLowerCase('tr-TR')))); if(sort==='price_asc')list.sort((a,b)=>Number(a.price)-Number(b.price));else if(sort==='price_desc')list.sort((a,b)=>Number(b.price)-Number(a.price));else if(sort==='stock')list.sort((a,b)=>b.stock_quantity-a.stock_quantity);return list},[products,q,category,brand,sort,categoryId,brandId]);
 const clear=()=>{setQ('');setCategory('');setBrand('');setSort('newest')};
 return <main className="store"><StoreHeader/><section className="catalog-page"><div className="section-head"><div><h1>Ürünler</h1><p className="muted">Vivatech ürünlerini ara, filtrele ve karşılaştır.</p></div><span>{filtered.length} ürün</span></div>
 <div className="catalog-layout"><aside className="catalog-filter"><label>Ürün Ara<input value={q} onChange={e=>setQ(e.target.value)} placeholder="Kamera, solar, 4G..."/></label><label>Kategori<select value={category} onChange={e=>setCategory(e.target.value)}><option value="">Tüm kategoriler</option>{categories.map(x=><option key={x.id} value={x.slug}>{x.name}</option>)}</select></label><label>Marka<select value={brand} onChange={e=>setBrand(e.target.value)}><option value="">Tüm markalar</option>{brands.map(x=><option key={x.id} value={x.slug}>{x.name}</option>)}</select></label><label>Sıralama<select value={sort} onChange={e=>setSort(e.target.value)}><option value="newest">En Yeniler</option><option value="price_asc">Fiyat: Artan</option><option value="price_desc">Fiyat: Azalan</option><option value="stock">Stok: Çoktan Aza</option></select></label><button className="button secondary" onClick={clear}>Filtreleri Temizle</button></aside>
 <section>{loading?<div className="empty">Ürünler yükleniyor…</div>:error?<div className="error">{error}</div>:filtered.length===0?<div className="empty">Aramanıza uygun aktif ürün bulunamadı.</div>:<div className="product-grid catalog-products">{filtered.map(p=>{const img=p.product_images?.find(x=>x.is_primary)?.image_url||p.product_images?.[0]?.image_url;return <Link className="product-card" href={`/product/${p.slug}`} key={p.id}><div className="product-media">{img?<Image src={img} alt={p.name} width={600} height={600}/>:<span>VIVATECH</span>}</div><div className="product-body"><h3>{p.name}</h3><div className="price-row"><strong>{money(p.price)}</strong>{p.compare_at_price&&<del>{money(p.compare_at_price)}</del>}</div><span className={p.stock_quantity>0?'stock-ok':'stock-no'}>{p.stock_quantity>0?`Stokta ${p.stock_quantity} adet`:'Stokta yok'}</span></div></Link>})}</div>}</section></div></section></main>
}
export default function ProductsPage(){return <Suspense fallback={<div className="empty">Ürünler yükleniyor…</div>}><ProductsContent/></Suspense>}
