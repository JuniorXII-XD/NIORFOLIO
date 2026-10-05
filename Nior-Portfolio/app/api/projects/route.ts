import {serverClient} from '@/lib/supabase/server';
import {isConfigured} from '@/lib/supabase/config';
import {json,failure,ownerWrite,boundedForm,textField,HttpError,validId,validLink,validMediaPath,mediaUrl} from '@/lib/journal';
import {starterProject,type Project} from '@/lib/projects';
export const dynamic='force-dynamic';
export async function GET(){try{
  if(!isConfigured())return json({projects:[starterProject]});
  const client=await serverClient();
  const {data,error}=await client.from('portfolio_projects').select('*').order('created_at',{ascending:false});
  if(error)throw error;
  return json({projects:(data||[]).map(p=>({...p,cover:p.cover_path?mediaUrl(client,p.cover_path):''}))});
}catch(error){return failure(error);}}
export async function POST(request:Request){try{
  const {client,user}=await ownerWrite(request);const form=await boundedForm(request);
  const project:Project={
    id:validId(textField(form.get('id'),80)||crypto.randomUUID()),
    title:textField(form.get('title'),100),category:textField(form.get('category'),60),
    summary:textField(form.get('summary'),300),story:textField(form.get('story'),4000),
    role:textField(form.get('role'),200),stack:textField(form.get('stack'),250),
    url:validLink(textField(form.get('url'),1000)),source:validLink(textField(form.get('source'),1000)),
    cover_path:validMediaPath(textField(form.get('cover_path'),150),user.id)
  };
  if(!project.title||!project.summary)throw new HttpError(400,'กรุณาใส่ชื่อและคำอธิบายผลงาน');
  const {error}=await client.from('portfolio_projects').upsert(project);
  if(error)throw error;return json({project});
}catch(error){return failure(error);}}
