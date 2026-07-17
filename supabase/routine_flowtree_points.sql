-- Dauerhafte, tagesbezogene Routine-Fortschritte und atomare FlowTree-Punkte.
alter table public.profiles
  add column if not exists growth_points integer not null default 0;

create table if not exists public.routine_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  routine_id uuid not null references public.routines(id) on delete cascade,
  progress_date date not null,
  status text not null default 'open' check (status in ('open', 'completed')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint routine_progress_user_routine_date_key unique (user_id, routine_id, progress_date)
);

create table if not exists public.flowtree_point_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  routine_id uuid references public.routines(id) on delete cascade,
  progress_date date not null,
  points integer not null check (points >= 0),
  transaction_type text not null,
  created_at timestamptz not null default now(),
  constraint flowtree_point_transaction_once unique (user_id, routine_id, progress_date, transaction_type)
);

create unique index if not exists flowtree_one_legacy_balance_per_user
  on public.flowtree_point_transactions (user_id)
  where transaction_type = 'legacy_balance';
create index if not exists routine_progress_user_date_idx
  on public.routine_progress (user_id, progress_date);
create index if not exists flowtree_transactions_user_idx
  on public.flowtree_point_transactions (user_id);

alter table public.routine_progress enable row level security;
alter table public.flowtree_point_transactions enable row level security;

drop policy if exists "Users can read own routine progress" on public.routine_progress;
create policy "Users can read own routine progress" on public.routine_progress
  for select using (auth.uid() = user_id);
drop policy if exists "Users can read own FlowTree transactions" on public.flowtree_point_transactions;
create policy "Users can read own FlowTree transactions" on public.flowtree_point_transactions
  for select using (auth.uid() = user_id);

grant select on public.routine_progress to authenticated;
grant select on public.flowtree_point_transactions to authenticated;

-- Vorhandene Punkte bleiben bei der Umstellung erhalten.
insert into public.flowtree_point_transactions
  (user_id, routine_id, progress_date, points, transaction_type)
select id, null, date '1970-01-01', greatest(growth_points, 0), 'legacy_balance'
from public.profiles
where growth_points > 0
on conflict do nothing;

create or replace function public.set_routine_completion(
  p_routine_id uuid,
  p_progress_date date,
  p_completed boolean,
  p_points integer default 10,
  p_period jsonb default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_total integer;
  v_routine public.routines%rowtype;
begin
  if v_user_id is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;
  if p_progress_date is null or p_points < 0 then
    raise exception 'Invalid routine progress input' using errcode = '22023';
  end if;

  select * into v_routine
  from public.routines
  where id = p_routine_id and user_id = v_user_id and deleted_at is null
  for update;
  if not found then
    raise exception 'Routine not found' using errcode = 'P0002';
  end if;

  insert into public.routine_progress
    (user_id, routine_id, progress_date, status, completed_at, updated_at)
  values
    (v_user_id, p_routine_id, p_progress_date,
     case when p_completed then 'completed' else 'open' end,
     case when p_completed then now() else null end, now())
  on conflict (user_id, routine_id, progress_date) do update set
    status = excluded.status,
    completed_at = excluded.completed_at,
    updated_at = now();

  if p_completed then
    insert into public.flowtree_point_transactions
      (user_id, routine_id, progress_date, points, transaction_type)
    values (v_user_id, p_routine_id, p_progress_date, p_points, 'routine_completed')
    on conflict (user_id, routine_id, progress_date, transaction_type) do nothing;
  else
    delete from public.flowtree_point_transactions
    where user_id = v_user_id
      and routine_id = p_routine_id
      and progress_date = p_progress_date
      and transaction_type = 'routine_completed';
  end if;

  update public.routines set
    current = case when p_completed then target else 0 end,
    progress = case when p_completed then 100 else 0 end,
    done = p_completed,
    period = coalesce(p_period, period),
    updated_at = now()
  where id = p_routine_id;

  select greatest(coalesce(sum(points), 0), 0)::integer into v_total
  from public.flowtree_point_transactions where user_id = v_user_id;

  update public.profiles
  set growth_points = v_total, updated_at = now()
  where id = v_user_id;

  return jsonb_build_object(
    'routine_id', p_routine_id,
    'progress_date', p_progress_date,
    'completed', p_completed,
    'growth_points', v_total
  );
end;
$$;

drop function if exists public.set_routine_completion(uuid, date, boolean, integer);
revoke all on function public.set_routine_completion(uuid, date, boolean, integer, jsonb) from public;
grant execute on function public.set_routine_completion(uuid, date, boolean, integer, jsonb) to authenticated;

create or replace function public.get_flowtree_growth_points()
returns integer
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select greatest(coalesce(sum(points), 0), 0)::integer
  from public.flowtree_point_transactions
  where user_id = auth.uid();
$$;

revoke all on function public.get_flowtree_growth_points() from public;
grant execute on function public.get_flowtree_growth_points() to authenticated;
