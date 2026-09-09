import AdminGate from './AdminGate';
const links=[['/admin','Dashboard'],['/admin/products','Ürünler'],['/admin/categories','Kategoriler'],['/admin/brands','Markalar'],['/admin/orders','Siparişler'],['/admin/promotions','Kampanyalar'],['/admin/banners','Bannerlar'],['/admin/content','İçerikler']];
export default function AdminLayout({children}:{children:React.ReactNode}){
 return <AdminGate><div className="shell"><aside className="sidebar"><div className="brand">VIVATECH ADMIN</div><nav className="nav">{links.map(([href,label])=><a key={href} href={href}>{label}</a>)}</nav><a className="logout" href="/admin/logout">Çıkış</a></aside><main className="content">{children}</main></div></AdminGate>
}
