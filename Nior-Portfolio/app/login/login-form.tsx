'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {browserClient} from '@/lib/supabase/client';
export default function LoginForm(){
  const router=useRouter();
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  async function login(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();const form=new FormData(event.currentTarget);setBusy(true);setError('');
    try{
      const client=browserClient();
      const {error}=await client.auth.signInWithPassword({email:String(form.get('email')).trim(),password:String(form.get('password'))});
      if(error)throw new Error('เข้าสู่ระบบไม่สำเร็จ ตรวจสอบอีเมลและรหัสผ่าน หรือลองใหม่ภายหลัง');
      const owner=await client.rpc('is_portfolio_owner');
      if(owner.error||owner.data!==true){await client.auth.signOut();throw new Error('บัญชีนี้ไม่มีสิทธิ์จัดการเว็บไซต์');}
      router.replace('/studio');router.refresh();
    }catch(error){setError((error as Error).message);setBusy(false);}
  }
  return <form onSubmit={login} className="login-form"><fieldset disabled={busy}><label className="field">อีเมล<input name="email" type="email" autoComplete="username" required/></label><label className="field">รหัสผ่าน<input name="password" type="password" autoComplete="current-password" required/></label>{error&&<p role="alert" className="form-error">{error}</p>}<button className="button" type="submit">{busy?'กำลังเข้าสู่ระบบ…':'เข้าสู่ระบบ'}</button></fieldset></form>;
}
