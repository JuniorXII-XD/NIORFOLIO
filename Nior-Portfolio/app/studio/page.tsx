import Link from 'next/link';
import {redirect} from 'next/navigation';
import {isOwner} from '@/lib/journal';
import {isConfigured} from '@/lib/supabase/config';
import {serverClient} from '@/lib/supabase/server';
import PortfolioStudio from './portfolio-studio';
import SignOut from './sign-out';
export const dynamic='force-dynamic';
export default async function Studio(){
 if(!isConfigured())redirect('/login');
 const client=await serverClient();const {data:{user}}=await client.auth.getUser();
 if(!user)redirect('/login');
 if(!await isOwner())return <main className="access-page"><h1>พื้นที่ของเจ้าของเว็บไซต์</h1><p>บัญชีนี้ไม่มีสิทธิ์แก้ไขเนื้อหา</p><Link href="/">กลับไปดูเว็บไซต์</Link><SignOut/></main>;
 return <PortfolioStudio/>;
}
