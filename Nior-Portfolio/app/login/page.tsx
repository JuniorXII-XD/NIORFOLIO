import Link from 'next/link';
import {isConfigured} from '@/lib/supabase/config';
import LoginForm from './login-form';
export const dynamic='force-dynamic';
export default function Login(){return <main className="access-page login-page"><Link className="wordmark" href="/">nior®</Link><p className="eyebrow">PORTFOLIO STUDIO</p><h1>พื้นที่ของเนียร์</h1><p>เข้าสู่ระบบเพื่อจัดการโปรไฟล์และผลงาน</p>{isConfigured()?<LoginForm/>:<p role="alert" className="form-error">ยังไม่ได้เชื่อมหลังบ้าน กรุณาตั้งค่าตามไฟล์ SETUP-TH.md</p>}<Link href="/">กลับไปดูเว็บไซต์ ↗</Link></main>;}
