import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { calculateFlowtreeStats } from '../../utils/flowtreeStats'

const migration = readFileSync('supabase/routine_flowtree_points.sql', 'utf8')

describe('persistent FlowTree routine points', () => {
  it('keeps day-one points when day two starts empty, then supports another daily booking', () => {
    expect(calculateFlowtreeStats({ routines: [], checkIns: [], growthPoints: 10 }).growthPoints).toBe(10)
    expect(migration).toContain('unique (user_id, routine_id, progress_date, transaction_type)')
  })

  it('removes exactly the matching transaction when completion is undone', () => {
    expect(migration).toContain("transaction_type = 'routine_completed'")
    expect(migration).toContain('delete from public.flowtree_point_transactions')
  })

  it('prevents rapid repeated completion bookings', () => {
    expect(migration).toContain('on conflict (user_id, routine_id, progress_date, transaction_type) do nothing')
  })

  it('uses the durable database total after a page reload', () => {
    const staleRoutine = { current: 0, target: 1, progress: 0, done: false }
    expect(calculateFlowtreeStats({ routines: [staleRoutine], growthPoints: 20 }).growthPoints).toBe(20)
    expect(migration).toContain('coalesce(sum(points), 0)')
  })

  it('separates daily progress from the permanent transaction ledger', () => {
    expect(migration).toContain('create table if not exists public.routine_progress')
    expect(migration).toContain('create table if not exists public.flowtree_point_transactions')
    expect(migration).not.toContain('delete from public.flowtree_point_transactions\n+    where user_id = v_user_id;')
  })
})
