import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
import {PGlite} from '@electric-sql/pglite';
const source=await readFile(new URL('../lib/validation.ts',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const {validLink,validId,validMediaPath,checkOrigin}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
test('reject unsafe links, traversal and cross-origin writes',()=>{
 for(const url of ['javascript:alert(1)','data:text/html,test','http://example.com','https://user:pass@example.com'])assert.throws(()=>validLink(url));
 assert.equal(validLink('https://example.com/project'),'https://example.com/project');
 assert.throws(()=>validId('../admin'));
 assert.throws(()=>validMediaPath('../../image.jpg'));
 assert.throws(()=>checkOrigin(new Request('https://portfolio.example/api/profile',{headers:{origin:'https://evil.example'}})));
 assert.doesNotThrow(()=>checkOrigin(new Request('https://portfolio.example/api/profile',{headers:{origin:'https://portfolio.example'}})));
 assert.doesNotThrow(()=>checkOrigin(new Request('http://localhost:3000/api/profile',{headers:{host:'portfolio.example',origin:'https://portfolio.example'}})));
 assert.throws(()=>checkOrigin(new Request('http://localhost:3000/api/profile',{headers:{host:'portfolio.example',origin:'http://portfolio.example'}})));
 assert.throws(()=>checkOrigin(new Request('https://portfolio.example/api/profile')));
});
test('PostgreSQL RLS: public reads, owner CRUD, no outsider writes or owner self-enrollment',async()=>{
 const db=new PGlite();
 const owner='11111111-1111-4111-8111-111111111111',stranger='22222222-2222-4222-8222-222222222222';
 try{
  // Minimal Supabase-owned schemas; app schema and policies below are the actual shipping SQL.
  await db.exec(`create role anon;create role authenticated;
   create schema auth;create schema storage;
   create table auth.users(id uuid primary key,email text);
   create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
   create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
   create table storage.objects(id bigint generated always as identity primary key,bucket_id text,name text);
   alter table storage.objects enable row level security;
   create function storage.foldername(name text) returns text[] language sql immutable as $$ select string_to_array(name,'/') $$;
   grant usage on schema public,auth,storage to anon,authenticated;
   grant select,insert,update,delete on storage.objects to authenticated;
   grant usage on sequence storage.objects_id_seq to authenticated;
   insert into auth.users values('${owner}','owner@example.test'),('${stranger}','other@example.test');`);
  const schema=await readFile(new URL('../supabase/schema.sql',import.meta.url),'utf8');
  await db.exec(schema);await db.exec(schema); // idempotent installation
  await db.exec(`insert into public.portfolio_owners values('${owner}');set role anon;`);
  assert.equal((await db.query('select count(*)::int as n from portfolio_projects')).rows[0].n,1);
  assert.equal((await db.query('select is_portfolio_owner() as owner')).rows[0].owner,false);
  await assert.rejects(db.exec("insert into portfolio_projects(id,title,summary) values('bad','Bad','Bad')"));
  await db.exec(`reset role;set role authenticated;set request.jwt.claim.sub='${stranger}';`);
  assert.equal((await db.query('select is_portfolio_owner() as owner')).rows[0].owner,false);
  await assert.rejects(db.exec(`insert into portfolio_owners values('${stranger}')`));
  await assert.rejects(db.exec("insert into portfolio_projects(id,title,summary) values('bad','Bad','Bad')"));
  assert.equal((await db.query("update portfolio_profile set name='Hacked' where id=1 returning id")).rows.length,0);
  assert.equal((await db.query("delete from portfolio_projects returning id")).rows.length,0);
  await assert.rejects(db.exec(`insert into storage.objects(bucket_id,name) values('portfolio-media','${stranger}/${stranger}.png')`));
  await db.exec(`set request.jwt.claim.sub='${owner}';`);
  assert.equal((await db.query('select is_portfolio_owner() as owner')).rows[0].owner,true);
  await db.exec("insert into portfolio_projects(id,title,summary) values('test','Project','Summary')");
  await db.exec("update portfolio_projects set title='Edited' where id='test'");
  assert.equal((await db.query("select title from portfolio_projects where id='test'")).rows[0].title,'Edited');
  await db.exec("update portfolio_profile set name='Nior updated' where id=1");
  await db.exec(`insert into storage.objects(bucket_id,name) values('portfolio-media','${owner}/${stranger}.png')`);
  await assert.rejects(db.exec(`insert into storage.objects(bucket_id,name) values('portfolio-media','${stranger}/${owner}.png')`));
  await assert.rejects(db.exec(`insert into storage.objects(bucket_id,name) values('portfolio-media','${owner}/${owner}.svg')`));
  await db.exec("delete from portfolio_projects where id='test'");
  assert.equal((await db.query("select id from portfolio_projects where id='test'")).rows.length,0);
 }finally{await db.close();}
});
