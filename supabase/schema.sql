-- MIKKO storage. Run once in Supabase → SQL Editor → New query → Run.
-- RLS is ON with no policies: the public (publishable/anon) key can read nothing.
-- The server uses the secret key, which bypasses RLS.

create table if not exists public.orders (
  id text primary key,
  created_at bigint not null,
  status text not null,
  tg_id bigint,
  data jsonb not null
);
create index if not exists orders_created_idx on public.orders (created_at desc);
create index if not exists orders_tg_idx on public.orders (tg_id, created_at desc);

create table if not exists public.staff (
  chat_id bigint primary key,
  added_at bigint not null,
  data jsonb not null
);

create table if not exists public.staff_messages (
  order_id text not null,
  chat_id bigint not null,
  message_id bigint not null,
  primary key (order_id, chat_id)
);

create table if not exists public.kv (
  k text primary key,
  v jsonb not null,
  expires_at bigint
);

create table if not exists public.interests (
  tg_id bigint not null,
  key text not null,
  score double precision not null default 0,
  primary key (tg_id, key)
);

-- Atomic "+= by" for interests (PostgREST upserts can't add to an existing value).
create or replace function public.bump_interest(p_tg_id bigint, p_key text, p_by double precision)
returns void
language sql
security invoker
set search_path = ''
as $$
  insert into public.interests (tg_id, key, score) values (p_tg_id, p_key, p_by)
  on conflict (tg_id, key) do update set score = public.interests.score + excluded.score;
$$;

alter table public.orders enable row level security;
alter table public.staff enable row level security;
alter table public.staff_messages enable row level security;
alter table public.kv enable row level security;
alter table public.interests enable row level security;

revoke execute on function public.bump_interest(bigint, text, double precision) from public, anon, authenticated;
