alter table public.profiles
  add column if not exists growth_points integer not null default 0,
  add column if not exists flowcoins integer not null default 0,
  add column if not exists current_level text not null default 'seed',
  add column if not exists planted_trees integer not null default 0,
  add column if not exists total_redeemed_flowcoins integer not null default 0;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'flow_coins'
  ) then
    update public.profiles
    set flowcoins = greatest(flowcoins, flow_coins)
    where flow_coins is not null;
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_growth_points_non_negative') then
    alter table public.profiles
      add constraint profiles_growth_points_non_negative
      check (growth_points >= 0) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profiles_flowcoins_non_negative') then
    alter table public.profiles
      add constraint profiles_flowcoins_non_negative
      check (flowcoins >= 0) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profiles_planted_trees_non_negative') then
    alter table public.profiles
      add constraint profiles_planted_trees_non_negative
      check (planted_trees >= 0) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profiles_total_redeemed_flowcoins_non_negative') then
    alter table public.profiles
      add constraint profiles_total_redeemed_flowcoins_non_negative
      check (total_redeemed_flowcoins >= 0) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profiles_current_level_allowed') then
    alter table public.profiles
      add constraint profiles_current_level_allowed
      check (current_level in ('seed', 'seedling', 'plant', 'tree', 'flowering-tree')) not valid;
  end if;
end $$;

create table if not exists public.flow_coin_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_key text not null,
  event_type text not null,
  source_id text,
  coins integer not null check (coins > 0),
  created_at timestamptz not null default now(),
  unique (user_id, event_key)
);

create index if not exists idx_flow_coin_events_user_created_at
  on public.flow_coin_events(user_id, created_at desc);

create table if not exists public.flow_tree_redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  coins_redeemed integer not null check (coins_redeemed > 0),
  organization text,
  status text not null default 'simulated',
  redeemed_at timestamptz not null default now()
);

create index if not exists idx_flow_tree_redemptions_user_redeemed_at
  on public.flow_tree_redemptions(user_id, redeemed_at desc);

alter table public.flow_coin_events enable row level security;
alter table public.flow_tree_redemptions enable row level security;

grant select, insert on public.flow_coin_events to authenticated;
grant select, insert on public.flow_tree_redemptions to authenticated;

drop policy if exists "Users can read own flow coin events" on public.flow_coin_events;
create policy "Users can read own flow coin events"
on public.flow_coin_events
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create own flow coin events" on public.flow_coin_events;
create policy "Users can create own flow coin events"
on public.flow_coin_events
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can read own tree redemptions" on public.flow_tree_redemptions;
create policy "Users can read own tree redemptions"
on public.flow_tree_redemptions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create own tree redemptions" on public.flow_tree_redemptions;
create policy "Users can create own tree redemptions"
on public.flow_tree_redemptions
for insert
to authenticated
with check (auth.uid() = user_id);

notify pgrst, 'reload schema';
