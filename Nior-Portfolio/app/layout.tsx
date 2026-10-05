import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Nior — Portfolio',description:'รู้จัก Nior ผ่านผลงานและโปรเจกต์ — @hypnxs_.n',icons:{icon:'/favicon.svg',shortcut:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="th" className="dark"><body>{children}</body></html>;}
