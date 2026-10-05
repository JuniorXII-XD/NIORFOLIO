import {json,failure,ownerWrite,validId} from '@/lib/journal';
export const dynamic='force-dynamic';
export async function DELETE(request:Request,context:{params:Promise<{id:string}>}){try{
  const {client}=await ownerWrite(request);const {id}=await context.params;
  const {error}=await client.from('portfolio_projects').delete().eq('id',validId(id));
  if(error)throw error;return json({ok:true});
}catch(error){return failure(error);}}
