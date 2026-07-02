create table if not exists public.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  general_mood text not null,
  stress_level text not null,
  tiredness_level text not null,
  physical_energy text not null,
  mental_energy text not null,
  concentration_level text not null,
  context_stressor text,
  mood text not null,
  available_time_minutes integer not null,
  support_goal text not null,
  recommended_task_ids text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.daily_checkins
  add column if not exists mood text;

alter table public.daily_checkins
  add column if not exists available_time_minutes integer;

alter table public.daily_checkins
  add column if not exists context_stressor text;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'daily_checkins'
      and column_name = 'mood_tags'
  ) then
    update public.daily_checkins
    set mood = coalesce(mood, nullif(mood_tags[1], ''), 'balanced')
    where mood is null;
  else
    update public.daily_checkins
    set mood = coalesce(mood, 'balanced')
    where mood is null;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'daily_checkins'
      and column_name = 'available_time'
  ) then
    update public.daily_checkins
    set available_time_minutes = coalesce(available_time_minutes, available_time, 5)
    where available_time_minutes is null;
  else
    update public.daily_checkins
    set available_time_minutes = coalesce(available_time_minutes, 5)
    where available_time_minutes is null;
  end if;
end $$;

alter table public.daily_checkins
  alter column mood set not null,
  alter column available_time_minutes set not null,
  alter column recommended_task_ids set default '{}';

create index if not exists idx_daily_checkins_user_id on public.daily_checkins(user_id);
create index if not exists idx_daily_checkins_created_at on public.daily_checkins(created_at);

alter table public.daily_checkins enable row level security;

create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop policy if exists "Users can read own daily checkins" on public.daily_checkins;
create policy "Users can read own daily checkins"
on public.daily_checkins
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create own daily checkins" on public.daily_checkins;
create policy "Users can create own daily checkins"
on public.daily_checkins
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own daily checkins" on public.daily_checkins;
create policy "Users can update own daily checkins"
on public.daily_checkins
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own daily checkins" on public.daily_checkins;
create policy "Users can delete own daily checkins"
on public.daily_checkins
for delete
to authenticated
using (auth.uid() = user_id);

drop trigger if exists update_daily_checkins_updated_at on public.daily_checkins;
create trigger update_daily_checkins_updated_at
before update on public.daily_checkins
for each row
execute function public.update_updated_at_column();
