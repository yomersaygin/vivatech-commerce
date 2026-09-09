import Link from 'next/link';
import Image from 'next/image';
import { StoreHeader } from '@/components/StoreHeader';
import { createPublicServerClient } from '@/lib/supabase-public-server';
import styles from './products.module.css';

type Category={id:string;name:string;slug:string};
type Brand={id:string;name:string;slug:string};
type Product={id:string;name:string;slug:string;price:number|string;compare_at_price:number|string|null;stock_quantity:number;category_id:string|null;brand_id:string|null;product_images:{image_url:string;is_primary:boolean;sort_order:number}[]|null};
const money=(v:number|string)=>Number(v).toLocaleString('tr-TR',{style:'currency',currency:'TRY'});
const one=(v:string|string[]|undefined)=>Array.isArray(v)?v[0]||'':v||'';

export default async function ProductsPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const sp=await searchParams; const q=one(sp.q).trim(); const category=one(sp.category); const brand=one(sp.brand); const sort=one(sp.sort)||'newest';
 const supabase=createPublicServerClient();
 const [{data:p},{data:c},{data:b}]=await Promise.all([
  supabase.from('products').select('id,name,slug,price,compare_at_price,stock_quantity,category_id,brand_id,product_images(image_url,is_primary,sort_order)').eq('is_active',true).order('created_at',{ascending:false}),
  supabase.from('categories').select('id,name,slug').eq('is_active',true).order('name'),
  supabase.from('brands').select('id,name,slug').eq('is_active',true).order('name')
 ]);
 const products=(p??[]) as Product[]; const categories=(c??[]) as Category[]; const brands=(b??[]) as Brand[];
 const categoryId=categories.find(x=>x.slug===category)?.id; const brandId=brands.find(x=>x.slug===brand)?.id;
 let filtered=products.filter(x=>(!category||x.category_id===categoryId)&&(!brand||x.brand_id===brandId)&&(!q||x.name.toLocaleLowerCase('tr-TR').includes(q.toLocaleLowerCase('tr-TR'))));
 if(sort==='price_asc')filtered=[...filtered].sort((a,b)=>Number(a.price)-Number(b.price)); else if(sort==='price_desc')filtered=[...filtered].sort((a,b)=>Number(b.price)-Number(a.price)); else if(sort==='stock')filtered=[...filtered].sort((a,b)=>b.stock_quantity-a.stock_quantity);
 return <main className="store"><StoreHeader/>
  <section className={styles.hero}><div><span className="eyebrow">VIVATECH MAĞAZA</span><h1>Güvenlik çözümlerini keşfedin.</h1><p>4G, solar ve akıllı kamera sistemlerini ihtiyacınıza göre filtreleyin.</p></div><div className={styles.heroStat}><strong>{products.length}</strong><span>aktif ürün</span></div></section>
  <section className={styles.page}><div className={styles.head}><div><span className="eyebrow">ÜRÜN KATALOĞU</span><h2>Tüm Ürünler</h2><p>{filtered.length} ürün listeleniyor</p></div></div>
  <div className={styles.layout}><aside className={styles.filter}><div className={styles.filterTitle}><strong>Filtrele</strong><Link href="/products">Temizle</Link></div><form action="/products" method="get">
   <label>Ürün Ara<input name="q" defaultValue={q} placeholder="Kamera, solar, 4G..."/></label>
   <label>Kategori<select name="category" defaultValue={category}><option value="">Tüm kategoriler</option>{categories.map(x=><option key={x.id} value={x.slug}>{x.name}</option>)}</select></label>
   <label>Marka<select name="brand" defaultValue={brand}><option value="">Tüm markalar</option>{brands.map(x=><option key={x.id} value={x.slug}>{x.name}</option>)}</select></label>
   <label>Sıralama<select name="sort" defaultValue={sort}><option value="newest">En Yeniler</option><option value="price_asc">Fiyat: Artan</option><option value="price_desc">Fiyat: Azalan</option><option value="stock">Stok: Çoktan Aza</option></select></label>
   <button className="button" type="submit">Sonuçları Göster</button></form><div className={styles.filterHelp}><b>Doğru ürünü bulamadınız mı?</b><span>4G, solar veya PTZ ihtiyacınıza göre ürünleri kolayca karşılaştırabilirsiniz.</span></div></aside>
   <section>{filtered.length===0?<div className="empty">Aramanıza uygun aktif ürün bulunamadı.</div>:<div className={`product-grid ${styles.grid}`}>{filtered.map(product=>{const imgs=[...(product.product_images??[])].sort((a,b)=>a.sort_order-b.sort_order);const img=imgs.find(x=>x.is_primary)?.image_url||imgs[0]?.image_url;const saving=product.compare_at_price&&Number(product.compare_at_price)>Number(product.price)?Math.round((1-Number(product.price)/Number(product.compare_at_price))*100):0;return <Link className={`product-card ${styles.card}`} href={`/product/${product.slug}`} key={product.id}><div className={`product-media ${styles.media}`}>{saving?<span className={styles.discount}>%{saving} İndirim</span>:null}{img?<Image src={img} alt={product.name} width={700} height={700}/>:<span>VIVATECH</span>}</div><div className="product-body"><span className={styles.brand}>VIVATECH</span><h3>{product.name}</h3><div className="price-row"><strong>{money(product.price)}</strong>{product.compare_at_price&&<del>{money(product.compare_at_price)}</del>}</div><span className={product.stock_quantity>0?'stock-ok':'stock-no'}>{product.stock_quantity>0?'✓ Stokta • Hızlı gönderim':'Stokta yok'}</span><div className={styles.cta}>Ürünü İncele <span>→</span></div></div></Link>})}</div>}</section>
  </div></section></main>
}
