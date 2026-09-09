import Link from 'next/link';
import Image from 'next/image';
import { StoreHeader } from '@/components/StoreHeader';
import { AddToCartButton } from '@/components/AddToCartButton';
import { RecoveryRedirect } from '@/components/RecoveryRedirect';
import { createPublicServerClient } from '@/lib/supabase-public-server';
import styles from './home.module.css';

type Product={id:string;name:string;slug:string;price:number|string;compare_at_price:number|string|null;stock_quantity:number;product_images:{image_url:string;is_primary:boolean}[]|null};
type Banner={id:string;title:string;subtitle:string|null;image_url:string|null;link_url:string|null;button_text:string|null;sort_order:number};
type Block={id:string;title:string;body:string|null;badge_text:string|null;link_url:string|null;button_text:string|null;placement:string;sort_order:number};
function money(value:number|string){return Number(value).toLocaleString('tr-TR',{style:'currency',currency:'TRY'});}
function ContentBlocks({items,placement}:{items:Block[];placement:string}){const rows=items.filter(x=>x.placement===placement);if(!rows.length)return null;return <section className="store-section"><div className="home-content-grid">{rows.map(x=><article className="home-content-card" key={x.id}>{x.badge_text&&<span className="eyebrow">{x.badge_text}</span>}<h3>{x.title}</h3>{x.body&&<p>{x.body}</p>}{x.link_url&&<Link className="text-link" href={x.link_url}>{x.button_text||'Detayları Gör'} →</Link>}</article>)}</div></section>}

export default async function Home(){
 const supabase=createPublicServerClient();
 const [{data:products},{data:banners},{data:blocks}]=await Promise.all([
  supabase.from('products').select('id,name,slug,price,compare_at_price,stock_quantity,product_images(image_url,is_primary)').eq('is_active',true).order('created_at',{ascending:false}).limit(8),
  supabase.from('site_banners').select('id,title,subtitle,image_url,link_url,button_text,sort_order').eq('is_active',true).order('sort_order').limit(4),
  supabase.from('content_blocks').select('id,title,body,badge_text,link_url,button_text,placement,sort_order').eq('is_active',true).order('placement').order('sort_order')
 ]);
 const items=(products??[]) as Product[]; const hero=((banners??[]) as Banner[])[0]; const content=(blocks??[]) as Block[];
 const categoryTiles=[
  {title:'4G Kameralar',desc:'Sim Kartlı\nHer Yerde Güvenlik',query:'4G',tone:'blue'},
  {title:'Solar Kameralar',desc:'Güneş Enerjisi ile\nKesintisiz Güvenlik',query:'Solar',tone:'green'},
  {title:'WiFi Kameralar',desc:'Kolay Kurulum\nAkıllı Güvenlik',query:'WiFi',tone:'cyan'},
  {title:'PTZ Kameralar',desc:'360° Görüş\nTam Kontrol',query:'PTZ',tone:'gray'},
 ];
 return <main className="store"><RecoveryRedirect/><StoreHeader/>
  <section className={styles.hero} style={hero?.image_url?{backgroundImage:`linear-gradient(90deg,rgba(5,23,42,.96) 0%,rgba(5,23,42,.73) 46%,rgba(5,23,42,.18) 100%),url(${hero.image_url})`}:undefined}>
   <div className={styles.heroContent}><span className={styles.heroKicker}>4G • Solar • Akıllı Takip</span><h1>{hero?.title||'Güvenliğin Akıllı Hali'}</h1><p>{hero?.subtitle||'Evinizi, iş yerinizi ve sevdiklerinizi her zaman güvende tutun. Vivatech akıllı güvenlik kameraları ile kontrol her zaman sizde.'}</p><div className={styles.heroButtons}><Link className={styles.primaryButton} href={hero?.link_url||'/products'}>{hero?.button_text||'Ürünleri İncele'} →</Link><Link className={styles.secondaryButton} href="#kategoriler">▦ Kategorileri Gör</Link></div><div className={styles.features}><span>▣ <b>Uzaktan İzleme</b><small>Mobil Uygulama</small></span><span>◉ <b>Hareket Algılama</b><small>Anında Bildirim</small></span><span>◐ <b>Renkli Gece Görüş</b><small>Daha Net Görüntü</small></span><span>◍ <b>Çift Yönlü Ses</b><small>Her Zaman İletişim</small></span></div></div>
   {!hero?.image_url&&<div className={styles.heroProduct}><div className={styles.cameraMock}>VIVATECH<br/>SMART SECURITY</div><span>Her An • Her Yerden<br/>Kontrol Sizde</span></div>}
  </section>

  <section id="kategoriler" className={styles.quickCategories}>{categoryTiles.map((tile,i)=><Link key={tile.title} href={`/products?q=${encodeURIComponent(tile.query)}`} className={`${styles.quickCard} ${styles[tile.tone]}`}><div><h3>{tile.title}</h3><p>{tile.desc.split('\n').map((line,idx)=><span key={idx}>{line}</span>)}</p><b>Ürünleri İncele →</b></div><div className={styles.quickIcon}>{['4G','☀','WiFi','360°'][i]}</div></Link>)}</section>

  <section className={styles.productsSection}><div className={styles.sectionTitle}><h2>Öne Çıkan Ürünler</h2><Link href="/products">Tüm Ürünleri Gör →</Link></div>{items.length?<div className={styles.productGrid}>{items.slice(0,4).map((p,i)=>{const img=p.product_images?.find(x=>x.is_primary)?.image_url||p.product_images?.[0]?.image_url;const hasDiscount=p.compare_at_price&&Number(p.compare_at_price)>Number(p.price);const discount=hasDiscount?Math.round((1-Number(p.price)/Number(p.compare_at_price!))*100):0;return <article className={styles.productCard} key={p.id}><Link href={`/product/${p.slug}`} className={styles.productImage}>{i===2&&!hasDiscount&&<span className={styles.newBadge}>Yeni Ürün</span>}{hasDiscount&&<span className={styles.discountBadge}>%{discount} İndirim</span>}{img?<Image src={img} alt={p.name} width={600} height={600}/>:<div className={styles.placeholder}>VIVATECH</div>}</Link><div className={styles.productInfo}><span className={styles.brandLabel}>VIVATECH</span><Link href={`/product/${p.slug}`}><h3>{p.name}</h3></Link><div className={styles.priceLine}>{hasDiscount&&<del>{money(p.compare_at_price!)}</del>}<strong>{money(p.price)}</strong></div><span className={p.stock_quantity>0?styles.inStock:styles.outStock}>{p.stock_quantity>0?'● Stokta':'Stokta Yok'}</span><div className={styles.productActions}><AddToCartButton className={styles.cartButton} product={{id:p.id,name:p.name,slug:p.slug,price:Number(p.price),stock_quantity:p.stock_quantity,image_url:img}}/><Link href={`/product/${p.slug}`} className={styles.inspectButton}>İncele</Link></div></div></article>})}</div>:<div className={styles.emptyState}>Aktif ürün bulunamadı.</div>}</section>

  <section className={styles.benefitBand}><div><span>🛡️</span><p><b>2 Yıl Garanti</b><small>Tüm ürünlerde resmi garanti güvencesi</small></p></div><div><span>🚚</span><p><b>Türkiye Geneli Hızlı Gönderim</b><small>Siparişiniz en kısa sürede kapınızda</small></p></div><div><span>🎧</span><p><b>Satış Sonrası Destek</b><small>Uzman ekibimiz her zaman yanınızda</small></p></div></section>

  <section className={styles.bottomPromos}><div><span>Akıllı Güvenlik</span><b>Daha Güvenli Yaşam</b></div><div><span>Sevdikleriniz</span><b>Her Zaman Güvende</b></div><div><span>Vivatech ile</span><b>Daha Güvenli Yarınlar</b></div></section>

  <ContentBlocks items={content} placement="home_after_products"/>
  <footer className="store-footer"><div className={styles.footerGrid}><div><span className={styles.footerBrand}>VIVATECH</span><p>Güvenlik kamera sistemlerinde modern, erişilebilir ve sürdürülebilir çözümler.</p></div><div><h4>Mağaza</h4><Link href="/products">Ürünler</Link><Link href="/#kategoriler">Kategoriler</Link><Link href="/cart">Sepet</Link></div><div><h4>Hesabım</h4><Link href="/account">Hesabım</Link><Link href="/account/orders">Siparişlerim</Link><Link href="/account/addresses">Adreslerim</Link></div><div><h4>Vivatech</h4><span>Güvenlik Kamera Sistemleri</span><span>Türkiye</span></div></div></footer>
 </main>
}
