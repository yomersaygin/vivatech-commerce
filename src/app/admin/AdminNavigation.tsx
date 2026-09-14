'use client';
import Link from 'next/link';
import { useEffect,useState } from 'react';
import { usePathname } from 'next/navigation';

const links=[['/admin','Dashboard'],['/admin/products','Ürünler'],['/admin/categories','Kategoriler'],['/admin/brands','Markalar'],['/admin/orders','Siparişler'],['/admin/promotions','Kampanyalar'],['/admin/banners','Bannerlar'],['/admin/content','İçerikler']];

export default function AdminNavigation(){
 const pathname=usePathname();const [open,setOpen]=useState(false);
 useEffect(()=>{setOpen(false)},[pathname]);
 const active=(href:string)=>href==='/admin'?pathname===href:pathname===href||pathname.startsWith(href+'/');
 return <><div className="admin-mobile-head"><b>VIVATECH ADMIN</b><button type="button" aria-expanded={open} aria-controls="admin-menu" onClick={()=>setOpen(value=>!value)}>{open?'Menüyü Kapat':'Menü'}</button></div><aside id="admin-menu" className={'sidebar'+(open?' open':'')}><Link className="brand" href="/admin">VIVATECH ADMIN</Link><nav className="nav" aria-label="Admin menüsü">{links.map(([href,label])=><Link key={href} href={href} className={active(href)?'active':undefined} aria-current={active(href)?'page':undefined}>{label}</Link>)}</nav><div className="admin-nav-footer"><Link href="/" target="_blank" rel="noreferrer">Mağazayı Görüntüle ↗</Link><Link className="logout" href="/admin/logout">Çıkış Yap</Link></div></aside></>
}
