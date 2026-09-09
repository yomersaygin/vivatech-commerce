import './globals.css';
import { CartProvider } from '@/components/CartProvider';
export const metadata = { title: 'Vivatech Commerce', description: 'Vivatech e-ticaret yönetimi' };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="tr"><body><CartProvider>{children}</CartProvider></body></html>}
