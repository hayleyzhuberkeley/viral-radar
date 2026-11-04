-- Feature 2: the data model.
-- formats belong to a user, examples belong to a format, and formats connect
-- to verticals many-to-many through format_verticals.

create table if not exists public.formats (
  id             bigint generated always as identity primary key,
  user_id        uuid not null default auth.uid() references public.users (id) on delete cascade,
  name           text not null check (length(trim(name)) > 0),
  creative_type  text check (creative_type in ('UGC with Avatar', 'UGC w/o Avatar', 'CGI', 'Product Only', 'Animation', 'Branding')),
  trend_status   text check (trend_status in ('Rising', 'Peak', 'Steady', 'Fading')),
  region         text check (region in ('NA', 'APAC', 'LATAM', 'EUI', 'METAP', 'Global')),
  heat           numeric check (heat between 0 and 100),
  ai_replicable  smallint check (ai_replicable between 1 and 5),
  ad_value       smallint check (ad_value between 1 and 5),
  new_in_7_days  integer check (new_in_7_days >= 0),
  score          numeric,
  mechanic       text,
  hook           text,
  why_works      text,
  brand_usage    text,
  prompt         text,
  swaps          text,
  first_seen     date,
  created_at     timestamptz not null default now()
);
create index if not exists formats_user_id_idx on public.formats (user_id);

create table if not exists public.examples (
  id         bigint generated always as identity primary key,
  format_id  bigint not null references public.formats (id) on delete cascade,
  platform   text check (platform in ('TikTok', 'Instagram', 'Xiaohongshu', 'YouTube', 'Other')),
  url        text not null check (url ~* '^https?://'),
  views      bigint check (views >= 0),
  posted_on  date
);
create index if not exists examples_format_id_idx on public.examples (format_id);

create table if not exists public.verticals (
  id    smallint generated always as identity primary key,
  name  text not null unique
);
insert into public.verticals (name)
values ('Retail'), ('CPG'), ('App'), ('Gaming'), ('Leads & Services'), ('Dining')
on conflict (name) do nothing;

create table if not exists public.format_verticals (
  format_id    bigint   not null references public.formats (id) on delete cascade,
  vertical_id  smallint not null references public.verticals (id) on delete cascade,
  primary key (format_id, vertical_id)
);

-- Row-level security: a row is visible and writable only to the user who owns
-- it, or who owns its parent format.
alter table public.formats          enable row level security;
alter table public.examples         enable row level security;
alter table public.verticals        enable row level security;
alter table public.format_verticals enable row level security;

create policy "formats: owner only" on public.formats
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "examples: owner of the format only" on public.examples
  for all
  using (exists (select 1 from public.formats f where f.id = format_id and f.user_id = auth.uid()))
  with check (exists (select 1 from public.formats f where f.id = format_id and f.user_id = auth.uid()));

create policy "format_verticals: owner of the format only" on public.format_verticals
  for all
  using (exists (select 1 from public.formats f where f.id = format_id and f.user_id = auth.uid()))
  with check (exists (select 1 from public.formats f where f.id = format_id and f.user_id = auth.uid()));

-- Verticals are a fixed lookup list. Any signed-in user can read it, nobody can change it.
create policy "verticals: signed-in users can read" on public.verticals
  for select to authenticated using (true);
