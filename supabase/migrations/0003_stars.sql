-- Feature 5: stars.
-- One junction table for everyone. Each row says "this user starred this format".

create table if not exists public.stars (
  user_id     uuid   not null default auth.uid() references public.users (id) on delete cascade,
  format_id   bigint not null references public.formats (id) on delete cascade,
  starred_at  timestamptz not null default now(),
  primary key (user_id, format_id)
);
create index if not exists stars_format_id_idx on public.stars (format_id);

alter table public.stars enable row level security;

-- You can see and remove only your own stars.
create policy "stars: read own" on public.stars
  for select using (auth.uid() = user_id);
create policy "stars: remove own" on public.stars
  for delete using (auth.uid() = user_id);

-- You can star only as yourself, and only a format you own.
create policy "stars: add own, on own formats" on public.stars
  for insert with check (
    auth.uid() = user_id
    and exists (select 1 from public.formats f where f.id = format_id and f.user_id = auth.uid())
  );
