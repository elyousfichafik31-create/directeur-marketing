import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'MarketMate AI — Votre copilote marketing',description:'Un espace simple pour préparer, créer et piloter le marketing de votre boutique.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="fr"><body>{children}</body></html>;}
