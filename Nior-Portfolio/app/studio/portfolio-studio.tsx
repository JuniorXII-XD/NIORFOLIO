'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {Toaster,toast} from 'sonner';
import Portfolio from '../portfolio';
import Background from '../scene';
import SignOut from './sign-out';
import {uploadImage} from '@/lib/upload';
type Profile={name:string;bio:string;avatar:string};
export default function PortfolioStudio(){
 const [profile,setProfile]=useState<Profile|null>(null),[file,setFile]=useState<File|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[owner,setOwner]=useState(false);
 async function load(){try{const r=await fetch('/api/profile');if(!r.ok)throw Error('โหลดโปรไฟล์ไม่สำเร็จ');const d=await r.json() as {profile:Profile;owner:boolean};setProfile(d.profile);setOwner(d.owner);setError('');}catch(e){setError((e as Error).message);}}
 useEffect(()=>{let active=true;fetch('/api/profile').then(async r=>{if(!r.ok)throw Error('โหลดโปรไฟล์ไม่สำเร็จ');return r.json();}).then(data=>{if(active){setProfile(data.profile);setOwner(data.owner);}}).catch(error=>{if(active)setError(error.message);});return()=>{active=false;};},[]);
 async function save(e:React.FormEvent){e.preventDefault();if(!profile)return;setBusy(true);setError('');try{if(file&&file.size>20*1024*1024)throw Error('รูปต้องไม่เกิน 20 MB');const form=new FormData();form.set('name',profile.name);form.set('bio',profile.bio);if(file)form.set('avatar_path',await uploadImage(file));const r=await fetch('/api/profile',{method:'POST',body:form});const d=await r.json() as {error?:string};if(!r.ok)throw Error(d.error||'บันทึกไม่สำเร็จ');setFile(null);(e.target as HTMLFormElement).reset();await load();toast.success('บันทึกโปรไฟล์แล้ว');}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 return <><Background/><Toaster theme="dark"/><header className="site-header"><Link className="wordmark" href="/">nior<span>®</span></Link><nav><Link className="quiet-button" href="/">ดูเว็บไซต์</Link><SignOut/></nav></header><main className="journal-shell portfolio-studio"><h1>จัดการพอร์ต</h1>{error&&<div role="alert" className="form-error">{error}<button className="quiet-button" onClick={load}>ลองโหลดใหม่</button></div>}{!profile&&!error&&<p>กำลังโหลดโปรไฟล์…</p>}{profile&&owner&&<form onSubmit={save} className="studio-profile"><fieldset disabled={busy}><legend>โปรไฟล์</legend><div className="studio-profile-grid"><div><span className="photo studio-avatar"><img src={profile.avatar} alt={profile.name}/></span><label className="field">เปลี่ยนรูปโปรไฟล์<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={e=>setFile(e.target.files?.[0]||null)}/><small>JPG · PNG · WebP · GIF / ไม่เกิน 20 MB</small></label></div><div><label className="field">ชื่อ<input required maxLength={50} value={profile.name} onChange={e=>setProfile({...profile,name:e.target.value})}/></label><label className="field">แนะนำตัว<textarea rows={3} maxLength={300} value={profile.bio} onChange={e=>setProfile({...profile,bio:e.target.value})}/></label><button className="button" disabled={busy}>{busy?'กำลังบันทึก…':'บันทึกโปรไฟล์'}</button></div></div></fieldset></form>}{owner&&<Portfolio owner quiet/>}</main></>;
}
