-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.
-- Saved chats: each user can only see and change their own chats.

create table if not exists public.chats (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null default 'New chat',
  messages jsonb not null default '[]'::jsonb,
  share_id text unique,
  updated_at timestamptz not null default now()
);

create index if not exists chats_user_updated on public.chats (user_id, updated_at desc);

alter table public.chats enable row level security;

create policy "chats: read own" on public.chats for select to authenticated using (user_id = auth.uid());
create policy "chats: insert own" on public.chats for insert to authenticated with check (user_id = auth.uid());
create policy "chats: update own" on public.chats for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "chats: delete own" on public.chats for delete to authenticated using (user_id = auth.uid());

-- Anyone with the secret share link can read ONE shared chat (they cannot list or search chats).
create or replace function public.get_shared_chat(p_share_id text)
returns table (title text, messages jsonb, updated_at timestamptz)
language sql security definer set search_path = public as $$
  select c.title, c.messages, c.updated_at from public.chats c where c.share_id = p_share_id and p_share_id <> ''
$$;
revoke all on function public.get_shared_chat(text) from public;
grant execute on function public.get_shared_chat(text) to anon, authenticated;
