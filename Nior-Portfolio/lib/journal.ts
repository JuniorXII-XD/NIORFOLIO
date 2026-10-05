import 'server-only';
import {serverClient} from '@/lib/supabase/server';
import {isConfigured,MEDIA_BUCKET} from '@/lib/supabase/config';
import {HttpError,checkOrigin} from './validation';
export {HttpError,textField,validId,validLink,validMediaPath} from './validation';
export async function isOwner(){
  if(!isConfigured())return false;
  const client=await serverClient();
  const {data:{user},error}=await client.auth.getUser();
  if(error||!user)return false;
  const result=await client.rpc('is_portfolio_owner');
  return !result.error && result.data===true;
}
export async function ownerWrite(request:Request){
  checkOrigin(request);
  if(!isConfigured())throw new HttpError(503,'ยังไม่ได้เชื่อมหลังบ้าน');
  const client=await serverClient();
  const {data:{user},error}=await client.auth.getUser();
  if(error||!user)throw new HttpError(401,'กรุณาเข้าสู่ระบบอีกครั้ง');
  const owner=await client.rpc('is_portfolio_owner');
  if(owner.error||owner.data!==true)throw new HttpError(403,'เฉพาะเจ้าของเว็บไซต์เท่านั้น');
  return {client,user};
}
export function json(value:unknown,status=200){
  return Response.json(value,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
}
export function failure(error:unknown){
  if(error instanceof HttpError)return json({error:error.message},error.status);
  console.error('Portfolio request failed',error);
  return json({error:'เชื่อมต่อหลังบ้านไม่สำเร็จ กรุณาตรวจสอบการตั้งค่า Supabase แล้วลองอีกครั้ง'},503);
}
// Image bytes go directly to Supabase; these routes accept only small metadata forms.
export async function boundedForm(request:Request){
  const reader=request.body?.getReader();
  if(!reader)throw new HttpError(400,'ไม่มีข้อมูล');
  let size=0;const parts:Uint8Array[]=[];
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;
    if(size>64*1024){await reader.cancel();throw new HttpError(413,'ข้อมูลยาวเกินกำหนด');}parts.push(value);}
  try{return await new Response(new Blob(parts as BlobPart[]),{headers:{'Content-Type':request.headers.get('content-type')||''}}).formData();}
  catch{throw new HttpError(400,'รูปแบบข้อมูลไม่ถูกต้อง');}
}
export function mediaUrl(client:Awaited<ReturnType<typeof serverClient>>,path:string){
  return path?client.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl:'';
}
