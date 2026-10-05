'use client';
import {browserClient} from './supabase/client';
import {MEDIA_BUCKET} from './supabase/config';
export async function uploadImage(file:File){
  if(!file.size||file.size>20*1024*1024)throw new Error('รูปต้องมีขนาดไม่เกิน 20 MB');
  const bytes=new Uint8Array(await file.slice(0,16).arrayBuffer());
  const ascii=(a:number,b:number)=>String.fromCharCode(...bytes.slice(a,b));
  let extension='',type='';
  if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255){extension='jpg';type='image/jpeg';}
  else if(bytes[0]===137&&ascii(1,4)==='PNG'&&bytes[4]===13&&bytes[5]===10&&bytes[6]===26&&bytes[7]===10){extension='png';type='image/png';}
  else if(ascii(0,4)==='RIFF'&&ascii(8,12)==='WEBP'){extension='webp';type='image/webp';}
  else if(['GIF87a','GIF89a'].includes(ascii(0,6))){extension='gif';type='image/gif';}
  else throw new Error('รองรับรูป JPG, PNG, WebP และ GIF เท่านั้น');
  const client=browserClient();
  const {data:{user},error}=await client.auth.getUser();
  if(error||!user)throw new Error('กรุณาเข้าสู่ระบบอีกครั้ง');
  const path=user.id+'/'+crypto.randomUUID()+'.'+extension;
  const result=await client.storage.from(MEDIA_BUCKET).upload(path,file,{contentType:type,upsert:false,cacheControl:'31536000'});
  if(result.error)throw new Error('อัปโหลดไม่สำเร็จ กรุณาตรวจสอบสิทธิ์และพื้นที่เก็บรูป');
  return path;
}
