import Link from 'next/link';
import Image from 'next/image';
import { StoreHeader } from '@/components/StoreHeader';
import { createPublicServerClient } from '@/lib/supabase-public-server';
import styles from './home.module.css';

type Category={id:string;name:string;slug:string};
type Product={id:string;name:string;slug:string;price:number|string;compare_at_price:number|string|null;stock_quantity:number;product_images:{image_url:string;is_primary:boolean}[]|null};
type Banner={id:string;title:string;subtitle:string|null;image_url:string|null;link_url:string|null;button_text:string|null;sort_order:number};
type Block={id:string;title:string;body:string|null;badge_text:string|null;link_url:string|null;button_text:string|null;placement:string;sort_order:number};

function money(value:number|string){return Number(value).toLocaleString('tr-TR',{style:'currency',currency:'TRY'});}
function ContentBlocks({items,placement}:{items:Block[];placement:string}){const rows=items.filter(x=>x.placement===placement);if(!rows.length)return null;return <section className="store-section"><div className="home-content-grid">{rows.map(x=><article className="home-content-card" key={x.id}>{x.badge_text&&<span className="eyebrow">{x.badge_text}</span>}<h3>{x.title}</h3>{x.body&&<p>{x.body}</p>}{x.link_url&&<Link className="text-link" href={x.link_url}>{x.button_text||'Detayları Gör'} →</Link>}</article>)}</div></section>}

export default async function Home(){
  const supabase=createPublicServerClient();
  const [{data:categories},{data:products},{data:banners},{data:blocks}]=await Promise.all([
    supabase.from('categories').select('id,name,slug').eq('is_active',true).order('name').limit(8),
    supabase.from('products').select('id,name,slug,price,compare_at_price,stock_quantity,product_images(image_url,is_primary)').eq('is_active',true).order('created_at',{ascending:false}).limit(12),
    supabase.from('site_banners').select('id,title,subtitle,image_url,link_url,button_text,sort_order').eq('is_active',true).order('sort_order').limit(4),
    supabase.from('content_blocks').select('id,title,body,badge_text,link_url,button_text,placement,sort_order').eq('is_active',true).order('placement').order('sort_order')
  ]);
  const cats=(categories??[]) as Category[]; const items=(products??[]) as Product[]; const hero=((banners??[]) as Banner[])[0]; const bannerItems=(banners??[]) as Banner[]; const content=(blocks??[]) as Block[];
  return <main className="store"><StoreHeader />
    <section className={`hero ${hero?.image_url?'hero-with-image':''}`} style={hero?.image_url?{backgroundImage:`linear-gradient(90deg,rgba(11,18,32,.94),rgba(11,18,32,.48)),url(${hero.image_url})`}:undefined}>
      <div><span className="eyebrow">{hero?'VIVATECH KAMPANYA':'VIVATECH GÜVENLİK SİSTEMLERİ'}</span><h1>{hero?.title||'Güvenliğinizi uzaktan yönetin.'}</h1><p>{hero?.subtitle||'4G, WiFi ve solar güvenlik kameralarında güvenilir çözümler. Evinizi, iş yerinizi ve arazinizi dilediğiniz yerden takip edin.'}</p><Link className="button" href={hero?.link_url||'/products'}>{hero?.button_text||'Ürünleri İncele'}</Link><div className={styles.heroNote}><span className={styles.heroChip}>✓ 2 Yıl Garanti</span><span className={styles.heroChip}>✓ Türkiye Geneli Kargo</span><span className={styles.heroChip}>✓ Güvenli Alışveriş</span></div></div>
      <div className="hero-panel"><strong>Vivatech Kamera Sistemleri</strong><span>4G • Solar • WiFi • PTZ • Akıllı Takip</span><span>İhtiyacınıza uygun güvenlik çözümünü kolayca bulun.</span></div>
    </section>

    <div className={styles.trustBar}><div className={styles.trustItem}><strong>🚚 Hızlı Gönderim</strong><span>Siparişlerinizi güvenle hazırlıyoruz.</span></div><div className={styles.trustItem}><strong>🛡️ 2 Yıl Garanti</strong><span>Satış sonrası destek ile yanınızdayız.</span></div><div className={styles.trustItem}><strong>💬 Uzman Destek</strong><span>Doğru kamera seçimi için yardım alın.</span></div><div className={styles.trustItem}><strong>🔒 Güvenli Sistem</strong><span>Sipariş ve stok altyapısı gerçek zamanlıdır.</span></div></div>

    {bannerItems.length>1&&<section className="store-section"><div className="banner-strip">{bannerItems.slice(1,4).map(x=><Link href={x.link_url||'/products'} className="mini-banner" key={x.id}><div><strong>{x.title}</strong>{x.subtitle&&<span>{x.subtitle}</span>}</div><span>{x.button_text||'İncele'} →</span></Link>)}</div></section>}
    <ContentBlocks items={content} placement="home_after_hero"/>

    <section id="kategoriler" className="store-section"><div className="section-head"><div><span className="eyebrow">ÜRÜN GRUPLARI</span><h2>Kategoriler</h2></div><Link className={styles.sectionLink} href="/products">Tüm ürünleri gör →</Link></div>{cats.length?<div className="category-grid">{cats.map((x,i)=><Link href={`/products?category=${x.slug}`} className="category-card" key={x.id}><div><div className={styles.categoryIcon}>{String(i+1).padStart(2,'0')}</div><strong>{x.name}</strong></div><span>Ürünleri incele →</span></Link>)}</div>:<div className={styles.emptyState}>Kategori kayıtları hazırlanıyor.</div>}</section>
    <ContentBlocks items={content} placement="home_after_categories"/>

    <div className={styles.promoRow}><div className={styles.promoCard}><strong>4G Kamera Sistemleri</strong><span>WiFi olmayan alanlarda SIM kart ile uzaktan izleme.</span><Link className="text-link" href="/products">Modelleri gör →</Link></div><div className={styles.promoCard}><strong>Solar Güvenlik</strong><span>Elektrik hattına ihtiyaç duymadan güneş enerjisiyle çalışan çözümler.</span><Link className="text-link" href="/products">Solar ürünler →</Link></div><div className={styles.promoCard}><strong>Akıllı Takip</strong><span>Hareket ve insan algılama özellikleriyle daha kontrollü güvenlik.</span><Link className="text-link" href="/products">Ürünleri keşfet →</Link></div></div>

    <section id="urunler" className="store-section"><div className="section-head"><div><span className="eyebrow">VIVATECH SEÇKİSİ</span><h2>Öne Çıkan Ürünler</h2></div><Link className={styles.sectionLink} href="/products">Tümünü gör →</Link></div>{items.length?<div className="product-grid">{items.map(p=>{const img=p.product_images?.find(x=>x.is_primary)?.image_url||p.product_images?.[0]?.image_url;const hasDiscount=p.compare_at_price&&Number(p.compare_at_price)>Number(p.price);return <Link className="product-card" href={`/product/${p.slug}`} key={p.id}><div className={`${styles.productMediaWrap} product-media`}>{hasDiscount&&<span className={styles.priceBadge}>FIRSAT</span>}{img?<Image src={img} alt={p.name} width={600} height={600}/>:<span>VIVATECH</span>}</div><div className="product-body"><h3>{p.name}</h3><div className="price-row"><strong>{money(p.price)}</strong>{hasDiscount&&<del>{money(p.compare_at_price!)}</del>}</div><span className={p.stock_quantity>0?'stock-ok':'stock-no'}>{p.stock_quantity>0?'Stokta • Hızlı gönderim':'Stokta yok'}</span><div className={styles.productCta}><span>Ürünü incele</span><span>→</span></div></div></Link>})}</div>:<div className={styles.emptyState}>Aktif ürün bulunamadı.</div>}</section>
    <ContentBlocks items={content} placement="home_after_products"/><ContentBlocks items={content} placement="home_before_footer"/>

    <footer className="store-footer"><div className={styles.footerGrid}><div><span className={styles.footerBrand}>VIVATECH</span><p>Güvenlik kamera sistemlerinde modern, erişilebilir ve sürdürülebilir çözümler.</p></div><div><h4>Mağaza</h4><Link href="/products">Ürünler</Link><Link href="/#kategoriler">Kategoriler</Link><Link href="/cart">Sepet</Link></div><div><h4>Hesabım</h4><Link href="/account">Hesabım</Link><Link href="/account/orders">Siparişlerim</Link><Link href="/account/addresses">Adreslerim</Link></div><div><h4>Vivatech</h4><span>Güvenlik Kamera Sistemleri</span><span>Türkiye</span></div></div></footer>
  </main>
}
