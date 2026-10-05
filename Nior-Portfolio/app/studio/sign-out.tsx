'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {browserClient} from '@/lib/supabase/client';
export default function SignOut(){
 const router=useRouter();
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 return <><button className="quiet-button" disabled={busy} onClick={async()=>{setBusy(true);setError('');try{const {error}=await browserClient().auth.signOut();if(error)throw error;router.replace('/login');router.refresh();}catch{setError('ออกจากระบบไม่สำเร็จ ลองอีกครั้ง');setBusy(false);}}}>{busy?'กำลังออก…':'ออกจากระบบ'}</button>{error&&<span role="alert">{error}</span>}</>;
}
