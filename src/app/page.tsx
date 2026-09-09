'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StoreHeader } from '@/components/StoreHeader';
import { supabase } from '@/lib/supabase';

type Category={id:string;name:string;slug:string};
type Product={id:string;name:string;slug:string;price:number|string;compare_at_price:number|string|null;stock_quantity:number;product_images:{image_url:string;is_primary:boolean}[]|null};
type Banner={id:string;title:string;subtitle:string|null;image_url:string|null;link_url:string|null;button_text:string|null;sort_order:number};
type Block={id:string;title:string;body:string|null;badge_text:string|null;link_url:string|null;button_text:string|null;placement:string;sort_order:number};

function ContentBlocks({items,placement}:{items:Block[];placement:string}){
  const rows=items.filter(x=>x.placement===placement);
  if(!rows.length)return null;
  return <section className="store-section"><div className="home-content-grid">{rows.map(x=><article className="home-content-card" key={x.id}>{x.badge_text&&<span className="eyebrow">{x.badge_text}</span>}<h3>{x.title}</h3>{x.body&&<p>{x.body}</p>}{x.link_url&&<Link className="text-link" href={x.link_url}>{x.button_text||'Detayları Gör'} →</Link>}</article>)}</div></section>
}

export default function Home(){
  const [categories,setCategories]=useState<Category[]>([]); const [products,setProducts]=useState<Product[]>([]); const [banners,setBanners]=useState<Banner[]>([]); const [blocks,setBlocks]=useState<Block[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState('');
  useEffect(()=>{(async()=>{const [{data:c,error:ce},{data:p,error:pe},{data:b,error:be},{data:cb,error:cbe}]=await Promise.all([
    supabase.from('categories').select('id,name,slug').eq('is_active',true).order('name').limit(8),
    supabase.from('products').select('id,name,slug,price,compare_at_price,stock_quantity,product_images(image_url,is_primary)').eq('is_active',true).order('created_at',{ascending:false}).limit(12),
    supabase.from('site_banners').select('id,title,subtitle,image_url,link_url,button_text,sort_order').order('sort_order'),
    supabase.from('content_blocks').select('id,title,body,badge_text,link_url,button_text,placement,sort_order').order('placement').order('sort_order')
  ]); if(ce||pe||be||cbe)setError(ce?.message||pe?.message||be?.message||cbe?.message||'Veri alınamadı'); setCategories((c??[]) as Category[]); setProducts((p??[]) as Product[]); setBanners((b??[]) as Banner[]); setBlocks((cb??[]) as Block[]); setLoading(false)})()},[]);
  const hero=banners[0];
  return <main className="store"><StoreHeader />
    <section className={`hero ${hero?.image_url?'hero-with-image':''}`} style={hero?.image_url?{backgroundImage:`linear-gradient(90deg,rgba(17,24,39,.92),rgba(17,24,39,.42)),url(${hero.image_url})`}:undefined}><div><span className="eyebrow">{hero?'VIVATECH KAMPANYA':'VIVATECH GÜVENLİK SİSTEMLERİ'}</span><h1>{hero?.title||'Akıllı güvenlik çözümleri, tek mağazada.'}</h1><p>{hero?.subtitle||'4G, WiFi ve solar güvenlik kameraları için sürdürülebilir Vivatech e-ticaret altyapısının müşteri yüzü.'}</p><Link className="button" href={hero?.link_url||'/products'}>{hero?.button_text||'Ürünleri İncele'}</Link></div><div className="hero-panel"><strong>{hero?'Güncel kampanya':'Ücretsiz altyapı ile geliştiriliyor'}</strong><span>{hero?'Vivatech fırsatlarını hemen inceleyin':'Gerçek stok • Güvenli veri • Mobil uyumlu yapı'}</span></div></section>
    {banners.length>1&&<section className="store-section"><div className="banner-strip">{banners.slice(1,4).map(x=><Link href={x.link_url||'/products'} className="mini-banner" key={x.id}><div><strong>{x.title}</strong>{x.subtitle&&<span>{x.subtitle}</span>}</div><span>{x.button_text||'İncele'} →</span></Link>)}</div></section>}
    <ContentBlocks items={blocks} placement="home_after_hero"/>
    <section id="kategoriler" className="store-section"><div className="section-head"><h2>Kategoriler</h2><span>{categories.length} aktif kategori</span></div><div className="category-grid">{categories.map(x=><Link href={`/products?category=${x.slug}`} className="category-card" key={x.id}><strong>{x.name}</strong><span>Ürünleri gör →</span></Link>)}</div></section>
    <ContentBlocks items={blocks} placement="home_after_categories"/>
    <section id="urunler" className="store-section"><div className="section-head"><h2>Öne Çıkan Ürünler</h2><span>Gerçek Supabase verisi</span></div>{loading?<div className="empty">Ürünler yükleniyor…</div>:error?<div className="error">{error}</div>:<div className="product-grid">{products.map(p=>{const img=p.product_images?.find(x=>x.is_primary)?.image_url||p.product_images?.[0]?.image_url;return <Link className="product-card" href={`/product/${p.slug}`} key={p.id}><div className="product-media">{img?<Image src={img} alt={p.name} width={600} height={600}/>:<span>VIVATECH</span>}</div><div className="product-body"><h3>{p.name}</h3><div className="price-row"><strong>{Number(p.price).toLocaleString('tr-TR',{style:'currency',currency:'TRY'})}</strong>{p.compare_at_price&&<del>{Number(p.compare_at_price).toLocaleString('tr-TR',{style:'currency',currency:'TRY'})}</del>}</div><span className={p.stock_quantity>0?'stock-ok':'stock-no'}>{p.stock_quantity>0?`Stokta ${p.stock_quantity} adet`:'Stokta yok'}</span></div></Link>})}</div>}</section>
    <ContentBlocks items={blocks} placement="home_after_products"/>
    <ContentBlocks items={blocks} placement="home_before_footer"/>
    <footer className="store-footer"><strong>VIVATECH</strong><span>Güvenlik kamera sistemleri</span></footer>
  </main>
}
