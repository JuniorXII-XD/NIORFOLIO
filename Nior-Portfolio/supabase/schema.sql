-- Run this entire file once in your NEW Supabase project's SQL Editor.
-- Re-running does not overwrite your existing content or owner list.
begin;
create table if not exists public.portfolio_owners (
 user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.portfolio_owners enable row level security;
revoke all on public.portfolio_owners from anon, authenticated;

create or replace function public.is_portfolio_owner() returns boolean
language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.portfolio_owners where user_id = (select auth.uid()));
$$;
revoke all on function public.is_portfolio_owner() from public;
grant execute on function public.is_portfolio_owner() to anon, authenticated;

create table if not exists public.portfolio_profile (
 id integer primary key check (id=1),
 name text not null check(length(name) between 1 and 50),
 bio text not null default '' check(length(bio)<=300),
 avatar_path text not null default '' check(avatar_path='' or avatar_path ~ '^[a-f0-9-]{36}/[a-f0-9-]{36}\.(jpg|png|webp|gif)$')
);
create table if not exists public.portfolio_projects (
 id text primary key check(id ~ '^[a-zA-Z0-9-]{1,80}$'),
 title text not null check(length(title) between 1 and 100),
 category text not null default '' check(length(category)<=60),
 summary text not null check(length(summary) between 1 and 300),
 story text not null default '' check(length(story)<=4000),
 role text not null default '' check(length(role)<=200),
 stack text not null default '' check(length(stack)<=250),
 url text not null default '' check(length(url)<=1000 and (url='' or url ~ '^https://[^[:space:]]+$')),
 source text not null default '' check(length(source)<=1000 and (source='' or source ~ '^https://[^[:space:]]+$')),
 cover_path text not null default '' check(cover_path='' or cover_path ~ '^[a-f0-9-]{36}/[a-f0-9-]{36}\.(jpg|png|webp|gif)$'),
 created_at timestamptz not null default now()
);
alter table public.portfolio_profile enable row level security;
alter table public.portfolio_projects enable row level security;
grant select on public.portfolio_profile, public.portfolio_projects to anon, authenticated;
grant insert, update, delete on public.portfolio_profile, public.portfolio_projects to authenticated;
revoke insert, update, delete on public.portfolio_profile, public.portfolio_projects from anon;

drop policy if exists portfolio_profile_read on public.portfolio_profile;
create policy portfolio_profile_read on public.portfolio_profile for select to anon, authenticated using(true);
drop policy if exists portfolio_profile_write on public.portfolio_profile;
create policy portfolio_profile_write on public.portfolio_profile for all to authenticated
 using((select public.is_portfolio_owner())) with check((select public.is_portfolio_owner()));
drop policy if exists portfolio_projects_read on public.portfolio_projects;
create policy portfolio_projects_read on public.portfolio_projects for select to anon, authenticated using(true);
drop policy if exists portfolio_projects_write on public.portfolio_projects;
create policy portfolio_projects_write on public.portfolio_projects for all to authenticated
 using((select public.is_portfolio_owner())) with check((select public.is_portfolio_owner()));

insert into public.portfolio_profile(id,name,bio) values(1,'Nior','') on conflict do nothing;
insert into public.portfolio_projects(id,title,category,summary,story,role,stack)
values('nior-journal','Nior / Interactive portfolio','PERSONAL WEBSITE',
'พื้นที่ของฉัน ที่เปิดให้ทุกคนเข้ามารู้จัก',
'เว็บไซต์พอร์ตส่วนตัว พร้อมแกลเลอรีผลงานแนวนอน แอนิเมชันระหว่างเลื่อน และระบบจัดการผลงาน',
'กำหนดแนวคิดและพัฒนาเว็บไซต์ร่วมกับ AI','React, TypeScript, Next.js, Supabase') on conflict do nothing;

-- Public images, owner-only writes. SVG/HTML are not accepted.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('portfolio-media','portfolio-media',true,20971520,array['image/jpeg','image/png','image/webp','image/gif'])
on conflict(id) do update set public=true,file_size_limit=20971520,
 allowed_mime_types=array['image/jpeg','image/png','image/webp','image/gif'];

drop policy if exists portfolio_media_insert on storage.objects;
create policy portfolio_media_insert on storage.objects for insert to authenticated
with check(bucket_id='portfolio-media' and (select public.is_portfolio_owner())
 and (storage.foldername(name))[1]=(select auth.uid())::text
 and name ~ '^[a-f0-9-]{36}/[a-f0-9-]{36}\.(jpg|png|webp|gif)$');
drop policy if exists portfolio_media_select on storage.objects;
create policy portfolio_media_select on storage.objects for select to authenticated
using(bucket_id='portfolio-media' and (select public.is_portfolio_owner()));
drop policy if exists portfolio_media_delete on storage.objects;
create policy portfolio_media_delete on storage.objects for delete to authenticated
using(bucket_id='portfolio-media' and (select public.is_portfolio_owner())
 and (storage.foldername(name))[1]=(select auth.uid())::text);
commit;
