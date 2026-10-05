-- 1. Create your user in Supabase Authentication > Users > Add user.
-- 2. Replace the email below with the EXACT email you created.
-- 3. Run this in SQL Editor. Expect one user_id in the result.
-- If there are no rows, the email does not match an existing Auth user.
insert into public.portfolio_owners(user_id)
select id from auth.users where lower(email)=lower('YOUR_EMAIL_HERE')
on conflict(user_id) do update set user_id=excluded.user_id
returning user_id;
