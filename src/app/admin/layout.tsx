import AdminGate from './AdminGate';
import AdminNavigation from './AdminNavigation';

export default function AdminLayout({children}:{children:React.ReactNode}){
 return <AdminGate><div className="shell"><AdminNavigation/><main className="content">{children}</main></div></AdminGate>
}
