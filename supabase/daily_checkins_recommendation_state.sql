ALTER TABLE public.daily_checkins
  ADD COLUMN IF NOT EXISTS recommendation_state JSONB NOT NULL DEFAULT '{}'::jsonb;
