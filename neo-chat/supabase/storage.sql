-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.
-- Creates two public-read buckets and lets each logged-in user write only in their own folder.

insert into storage.buckets (id, name, public)
values ('photo-edits', 'photo-edits', true), ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Photos used for Nano Edit (temporary; the app deletes them after the result loads)
create policy "photo-edits: upload own" on storage.objects for insert to authenticated
  with check (bucket_id = 'photo-edits' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "photo-edits: delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'photo-edits' and (storage.foldername(name))[1] = auth.uid()::text);

-- Profile pictures
create policy "avatars: upload own" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars: update own" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars: delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
