import {serverClient} from '@/lib/supabase/server';
import {isConfigured} from '@/lib/supabase/config';
import {isOwner,ownerWrite,json,failure,boundedForm,textField,HttpError,validMediaPath,mediaUrl} from '@/lib/journal';
export const dynamic='force-dynamic';
export async function GET(){try{
  if(!isConfigured())return json({profile:{name:'Nior',bio:'',avatar:'/profile.jpg'},owner:false});
  const client=await serverClient();
  const {data,error}=await client.from('portfolio_profile').select('name,bio,avatar_path').eq('id',1).maybeSingle();
  if(error)throw error;
  return json({profile:{name:data?.name||'Nior',bio:data?.bio||'',avatar:data?.avatar_path?mediaUrl(client,data.avatar_path):'/profile.jpg'},owner:await isOwner()});
}catch(error){return failure(error);}}
export async function POST(request:Request){try{
  const {client,user}=await ownerWrite(request);const form=await boundedForm(request);
  const name=textField(form.get('name'),50),bio=textField(form.get('bio'),300);
  if(!name)throw new HttpError(400,'กรุณาใส่ชื่อ');
  const update:{id:number;name:string;bio:string;avatar_path?:string}={id:1,name,bio};
  if(form.has('avatar_path'))update.avatar_path=validMediaPath(textField(form.get('avatar_path'),150),user.id);
  const {error}=await client.from('portfolio_profile').upsert(update);
  if(error)throw error;return json({ok:true});
}catch(error){return failure(error);}}
