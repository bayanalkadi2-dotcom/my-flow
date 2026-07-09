create table if not exists public.sleep_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sleep_date date not null,
  bedtime time not null,
  wake_time time not null,
  duration_minutes integer not null check (duration_minutes > 0 and duration_minutes <= 1440),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, sleep_date)
);

alter table public.sleep_entries
  add column if not exists updated_at timestamptz not null default now();

alter table public.sleep_entries
  alter column sleep_date drop default;

create index if not exists idx_sleep_entries_user_date
  on public.sleep_entries(user_id, sleep_date);

create unique index if not exists idx_sleep_entries_user_date_unique
  on public.sleep_entries(user_id, sleep_date);

alter table public.sleep_entries enable row level security;

grant select, insert, update, delete on public.sleep_entries to authenticated;

drop policy if exists "Users can read own sleep entries" on public.sleep_entries;
create policy "Users can read own sleep entries"
on public.sleep_entries for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create own sleep entries" on public.sleep_entries;
drop policy if exists "Users can insert own sleep entries" on public.sleep_entries;
create policy "Users can insert own sleep entries"
on public.sleep_entries for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own sleep entries" on public.sleep_entries;
create policy "Users can update own sleep entries"
on public.sleep_entries for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own sleep entries" on public.sleep_entries;
create policy "Users can delete own sleep entries"
on public.sleep_entries for delete to authenticated
using (auth.uid() = user_id);

create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_sleep_entries_updated_at on public.sleep_entries;
create trigger update_sleep_entries_updated_at
before update on public.sleep_entries
for each row execute function public.update_updated_at_column();

notify pgrst, 'reload schema';
