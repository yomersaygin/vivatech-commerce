'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
export function AccountNav(){
 const pathname=usePathname();
 const items=[['/account','Genel Bakış'],['/account/orders','Siparişlerim'],['/account/addresses','Adreslerim'],['/account/profile','Profilim']];
 return <aside className="account-nav"><h3>Hesabım</h3>{items.map(([href,label])=><Link key={href} className={pathname===href||pathname.startsWith(href+'/')?'active':''} href={href}>{label}</Link>)}</aside>
}
