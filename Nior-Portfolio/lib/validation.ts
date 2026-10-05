export class HttpError extends Error {
  constructor(public status:number,message:string){super(message);}
}
export function textField(value:FormDataEntryValue|null,max:number) {
  if(typeof value!=='string') return '';
  if(value.length>max) throw new HttpError(400,'ข้อความยาวเกินกำหนด');
  return value.trim();
}
export function validId(id:string){
  if(!/^[a-zA-Z0-9-]{1,80}$/.test(id)) throw new HttpError(400,'รหัสผลงานไม่ถูกต้อง');
  return id;
}
export function validLink(value:string){
  if(!value) return '';
  try {const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password)throw Error();}
  catch{throw new HttpError(400,'ลิงก์ต้องเป็น https:// ที่ถูกต้อง');}
  return value;
}
export function validMediaPath(value:string,userId?:string){
  if(!value)return '';
  if(!/^[a-f0-9-]{36}\/[a-f0-9-]{36}\.(jpg|png|webp|gif)$/.test(value) || (userId&&!value.startsWith(userId+'/')))
    throw new HttpError(400,'ตำแหน่งรูปภาพไม่ถูกต้อง');
  return value;
}
export function checkOrigin(request:Request){
  const origin=request.headers.get('origin');
  const host=request.headers.get('host')||new URL(request.url).host;
  try {
    if(!origin)throw Error();
    const parsed=new URL(origin);
    const local=['localhost','127.0.0.1','[::1]'].includes(parsed.hostname);
    if(parsed.origin!==origin || parsed.host!==host || (parsed.protocol!=='https:'&&!(local&&parsed.protocol==='http:')))throw Error();
  }catch{throw new HttpError(403,'กรุณาบันทึกผ่านเว็บไซต์นี้');}
}
