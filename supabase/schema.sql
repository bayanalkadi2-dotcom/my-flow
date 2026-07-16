-- Enable RLS for all tables
ALTER DATABASE postgres SET statement_timeout TO '30s';

-- ============================================
-- Tabelle: profiles
-- Speichert Benutzerprofil-Informationen
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS age INTEGER,
  ADD COLUMN IF NOT EXISTS height_cm NUMERIC(5, 1),
  ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(5, 1),
  ADD COLUMN IF NOT EXISTS student_status TEXT,
  ADD COLUMN IF NOT EXISTS age_group TEXT,
  ADD COLUMN IF NOT EXISTS education_level TEXT,
  ADD COLUMN IF NOT EXISTS daily_context TEXT,
  ADD COLUMN IF NOT EXISTS main_challenges TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS support_goals TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_age_range') THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_age_range
      CHECK (age IS NULL OR (age BETWEEN 16 AND 120)) NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_height_cm_range') THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_height_cm_range
      CHECK (height_cm IS NULL OR (height_cm BETWEEN 100 AND 250)) NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_weight_kg_range') THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_weight_kg_range
      CHECK (weight_kg IS NULL OR (weight_kg BETWEEN 25 AND 350)) NOT VALID;
  END IF;
END $$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profil: Benutzer können nur ihr eigenes Profil lesen
CREATE POLICY "Users can read own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Profil: Benutzer können nur ihr eigenes Profil aktualisieren
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can create own profile" ON public.profiles;
CREATE POLICY "Users can create own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Profil: Ein Admin-Trigger erzeugt automatisch ein Profil nach der Registrierung
-- (Dies wird durch einen Trigger oder eine Stored Procedure implementiert)

-- ============================================
-- Tabelle: routines
-- Speichert Gewohnheiten/Routinen des Benutzers
-- ============================================
CREATE TABLE IF NOT EXISTS public.routines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  current DECIMAL(10, 2) DEFAULT 0,
  target DECIMAL(10, 2) DEFAULT 1,
  unit VARCHAR(100) DEFAULT 'Mal',
  progress INTEGER DEFAULT 0,
  done BOOLEAN DEFAULT false,
  type VARCHAR(50),
  mood VARCHAR(50),
  period JSONB,
  increment_label VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_routines_user_id ON public.routines(user_id);
CREATE INDEX idx_routines_deleted_at ON public.routines(deleted_at);

ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;

-- Routines: Benutzer können nur ihre eigenen Routinen lesen
CREATE POLICY "Users can read own routines"
ON public.routines
FOR SELECT
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Routines: Benutzer können nur ihre eigenen Routinen erstellen
CREATE POLICY "Users can create own routines"
ON public.routines
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Routines: Benutzer können nur ihre eigenen Routinen aktualisieren
CREATE POLICY "Users can update own routines"
ON public.routines
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Routines: Benutzer können nur ihre eigenen Routinen löschen (soft delete)
CREATE POLICY "Users can delete own routines"
ON public.routines
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- Tabelle: routine_history
-- Speichert die Historie von Routine-Änderungen (für Statistiken)
-- ============================================
CREATE TABLE IF NOT EXISTS public.routine_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  routine_id UUID NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  value DECIMAL(10, 2),
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_routine_history_user_id ON public.routine_history(user_id);
CREATE INDEX idx_routine_history_routine_id ON public.routine_history(routine_id);
CREATE INDEX idx_routine_history_date ON public.routine_history(date);

ALTER TABLE public.routine_history ENABLE ROW LEVEL SECURITY;

-- History: Benutzer können nur ihre eigene Historie lesen
CREATE POLICY "Users can read own routine history"
ON public.routine_history
FOR SELECT
USING (auth.uid() = user_id);

-- History: Benutzer können ihre eigene Historie erstellen
CREATE POLICY "Users can create own routine history"
ON public.routine_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Tabelle: user_settings
-- Speichert benutzer-spezifische Einstellungen
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  language_style VARCHAR(50) DEFAULT 'german',
  communication_style VARCHAR(50) DEFAULT 'casual',
  theme VARCHAR(50) DEFAULT 'Hell',
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Settings: Benutzer können nur ihre eigenen Einstellungen lesen
CREATE POLICY "Users can read own settings"
ON public.user_settings
FOR SELECT
USING (auth.uid() = user_id);

-- Settings: Benutzer können nur ihre eigenen Einstellungen aktualisieren
CREATE POLICY "Users can update own settings"
ON public.user_settings
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Settings: Benutzer können ihre Einstellungen erstellen
CREATE POLICY "Users can create own settings"
ON public.user_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Trigger: Auto-create profile on auth user creation
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'display_name');
  
  INSERT INTO public.user_settings (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Trigger: Auto-update updated_at on profile changes
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_routines_updated_at ON public.routines;
CREATE TRIGGER update_routines_updated_at
  BEFORE UPDATE ON public.routines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Tabelle: sleep_entries
-- Speichert Schlafenszeit, Aufstehzeit und berechnete Dauer
-- ============================================
CREATE TABLE IF NOT EXISTS public.sleep_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sleep_date DATE NOT NULL,
  bedtime TIME NOT NULL,
  wake_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0 AND duration_minutes <= 1440),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, sleep_date)
);

CREATE INDEX IF NOT EXISTS idx_sleep_entries_user_date ON public.sleep_entries(user_id, sleep_date);
ALTER TABLE public.sleep_entries ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sleep_entries TO authenticated;

CREATE POLICY "Users can read own sleep entries" ON public.sleep_entries
FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sleep entries" ON public.sleep_entries
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sleep entries" ON public.sleep_entries
FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own sleep entries" ON public.sleep_entries
FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_sleep_entries_updated_at
  BEFORE UPDATE ON public.sleep_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ============================================
-- Tabelle: daily_checkins
-- Speichert den intelligenten Tages-Check-in und empfohlene Aufgaben
-- ============================================
CREATE TABLE IF NOT EXISTS public.daily_checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  general_mood TEXT NOT NULL,
  stress_level TEXT NOT NULL,
  tiredness_level TEXT NOT NULL,
  physical_energy TEXT NOT NULL,
  mental_energy TEXT NOT NULL,
  concentration_level TEXT NOT NULL,
  context_stressor TEXT,
  mood TEXT NOT NULL,
  available_time_minutes INTEGER NOT NULL,
  support_goal TEXT NOT NULL,
  recommended_task_ids TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.daily_checkins
  ADD COLUMN IF NOT EXISTS mood TEXT;

ALTER TABLE public.daily_checkins
  ADD COLUMN IF NOT EXISTS available_time_minutes INTEGER;

ALTER TABLE public.daily_checkins
  ADD COLUMN IF NOT EXISTS context_stressor TEXT;

ALTER TABLE public.daily_checkins
  ADD COLUMN IF NOT EXISTS recommendation_state JSONB NOT NULL DEFAULT '{}'::jsonb;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'daily_checkins'
      AND column_name = 'mood_tags'
  ) THEN
    UPDATE public.daily_checkins
    SET mood = COALESCE(mood, NULLIF(mood_tags[1], ''), 'balanced')
    WHERE mood IS NULL;
  ELSE
    UPDATE public.daily_checkins
    SET mood = COALESCE(mood, 'balanced')
    WHERE mood IS NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'daily_checkins'
      AND column_name = 'available_time'
  ) THEN
    UPDATE public.daily_checkins
    SET available_time_minutes = COALESCE(available_time_minutes, available_time, 5)
    WHERE available_time_minutes IS NULL;
  ELSE
    UPDATE public.daily_checkins
    SET available_time_minutes = COALESCE(available_time_minutes, 5)
    WHERE available_time_minutes IS NULL;
  END IF;
END $$;

ALTER TABLE public.daily_checkins
  ALTER COLUMN mood SET NOT NULL,
  ALTER COLUMN available_time_minutes SET NOT NULL,
  ALTER COLUMN recommended_task_ids SET DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_id ON public.daily_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_created_at ON public.daily_checkins(created_at);

ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own daily checkins" ON public.daily_checkins;
CREATE POLICY "Users can read own daily checkins"
ON public.daily_checkins
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own daily checkins" ON public.daily_checkins;
CREATE POLICY "Users can create own daily checkins"
ON public.daily_checkins
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own daily checkins" ON public.daily_checkins;
CREATE POLICY "Users can update own daily checkins"
ON public.daily_checkins
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own daily checkins" ON public.daily_checkins;
CREATE POLICY "Users can delete own daily checkins"
ON public.daily_checkins
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_daily_checkins_updated_at ON public.daily_checkins;
CREATE TRIGGER update_daily_checkins_updated_at
  BEFORE UPDATE ON public.daily_checkins
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Freunde und gemeinsame Challenges
-- ============================================
CREATE TABLE IF NOT EXISTS public.friend_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ,
  CHECK (requester_id <> addressee_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS friend_requests_one_pending_pair
  ON public.friend_requests (LEAST(requester_id, addressee_id), GREATEST(requester_id, addressee_id))
  WHERE status = 'pending';

CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_a UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_b UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (user_a < user_b),
  UNIQUE (user_a, user_b)
);

CREATE TABLE IF NOT EXISTS public.challenge_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenger_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  template_key TEXT NOT NULL,
  title TEXT NOT NULL,
  duration_days INTEGER NOT NULL CHECK (duration_days BETWEEN 1 AND 365),
  daily_goal NUMERIC(10, 2) NOT NULL CHECK (daily_goal > 0),
  goal_unit TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ,
  CHECK (challenger_id <> invitee_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS challenge_requests_one_pending_template
  ON public.challenge_requests (LEAST(challenger_id, invitee_id), GREATEST(challenger_id, invitee_id), template_key)
  WHERE status = 'pending';

CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID UNIQUE REFERENCES public.challenge_requests(id) ON DELETE SET NULL,
  challenger_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  opponent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  template_key TEXT NOT NULL,
  title TEXT NOT NULL,
  duration_days INTEGER NOT NULL CHECK (duration_days BETWEEN 1 AND 365),
  daily_goal NUMERIC(10, 2) NOT NULL CHECK (daily_goal > 0),
  goal_unit TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  starts_on DATE NOT NULL DEFAULT CURRENT_DATE,
  ends_on DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (challenger_id <> opponent_id)
);

CREATE TABLE IF NOT EXISTS public.challenge_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  progress_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (challenge_id, user_id, progress_date)
);

CREATE INDEX IF NOT EXISTS idx_friend_requests_addressee ON public.friend_requests(addressee_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_user_a ON public.friendships(user_a);
CREATE INDEX IF NOT EXISTS idx_friendships_user_b ON public.friendships(user_b);
CREATE INDEX IF NOT EXISTS idx_challenge_requests_invitee ON public.challenge_requests(invitee_id, status);
CREATE INDEX IF NOT EXISTS idx_challenges_users ON public.challenges(challenger_id, opponent_id);
CREATE INDEX IF NOT EXISTS idx_challenge_progress_lookup ON public.challenge_progress(challenge_id, user_id, progress_date);

ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_progress ENABLE ROW LEVEL SECURITY;

GRANT SELECT, DELETE ON public.friend_requests TO authenticated;
GRANT SELECT ON public.friendships TO authenticated;
GRANT SELECT, INSERT ON public.challenge_requests TO authenticated;
GRANT SELECT ON public.challenges TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.challenge_progress TO authenticated;

CREATE POLICY "Users can read own friend requests" ON public.friend_requests
  FOR SELECT TO authenticated
  USING (auth.uid() IN (requester_id, addressee_id));

CREATE POLICY "Users can cancel own friend requests" ON public.friend_requests
  FOR DELETE TO authenticated
  USING (auth.uid() = requester_id AND status = 'pending');

CREATE POLICY "Users can read own friendships" ON public.friendships
  FOR SELECT TO authenticated
  USING (auth.uid() IN (user_a, user_b));

CREATE POLICY "Users can read own challenge requests" ON public.challenge_requests
  FOR SELECT TO authenticated
  USING (auth.uid() IN (challenger_id, invitee_id));

CREATE POLICY "Users can create challenge requests" ON public.challenge_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = challenger_id
    AND EXISTS (
      SELECT 1 FROM public.friendships f
      WHERE (f.user_a = challenger_id AND f.user_b = invitee_id)
         OR (f.user_a = invitee_id AND f.user_b = challenger_id)
    )
  );

CREATE POLICY "Participants can read challenges" ON public.challenges
  FOR SELECT TO authenticated
  USING (auth.uid() IN (challenger_id, opponent_id));

CREATE POLICY "Participants can read challenge progress" ON public.challenge_progress
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.challenges c
      WHERE c.id = challenge_id AND auth.uid() IN (c.challenger_id, c.opponent_id)
    )
  );

CREATE POLICY "Users can create own challenge progress" ON public.challenge_progress
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.challenges c
      WHERE c.id = challenge_id
        AND auth.uid() IN (c.challenger_id, c.opponent_id)
        AND progress_date BETWEEN c.starts_on AND c.ends_on
    )
  );

CREATE POLICY "Users can update own challenge progress" ON public.challenge_progress
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own challenge progress" ON public.challenge_progress
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Namen sind nur für Personen sichtbar, mit denen eine Anfrage, Freundschaft oder Challenge besteht.
CREATE POLICY "Users can read social profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.friend_requests r
      WHERE auth.uid() IN (r.requester_id, r.addressee_id)
        AND id IN (r.requester_id, r.addressee_id)
    )
    OR EXISTS (
      SELECT 1 FROM public.friendships f
      WHERE auth.uid() IN (f.user_a, f.user_b)
        AND id IN (f.user_a, f.user_b)
    )
    OR EXISTS (
      SELECT 1 FROM public.challenge_requests r
      WHERE auth.uid() IN (r.challenger_id, r.invitee_id)
        AND id IN (r.challenger_id, r.invitee_id)
    )
  );

CREATE OR REPLACE FUNCTION public.send_friend_request(target_email TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_id UUID;
  new_request_id UUID;
BEGIN
  SELECT id INTO target_id FROM public.profiles WHERE lower(email) = lower(trim(target_email));
  IF target_id IS NULL THEN
    RAISE EXCEPTION 'Kein MyFlow-Konto mit dieser E-Mail-Adresse gefunden.';
  END IF;
  IF target_id = auth.uid() THEN
    RAISE EXCEPTION 'Du kannst dich nicht selbst hinzufügen.';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.friendships
    WHERE (user_a = LEAST(auth.uid(), target_id) AND user_b = GREATEST(auth.uid(), target_id))
  ) THEN
    RAISE EXCEPTION 'Ihr seid bereits Freunde.';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.friend_requests
    WHERE status = 'pending'
      AND LEAST(requester_id, addressee_id) = LEAST(auth.uid(), target_id)
      AND GREATEST(requester_id, addressee_id) = GREATEST(auth.uid(), target_id)
  ) THEN
    RAISE EXCEPTION 'Für diese Person besteht bereits eine Anfrage.';
  END IF;

  INSERT INTO public.friend_requests (requester_id, addressee_id)
  VALUES (auth.uid(), target_id)
  RETURNING id INTO new_request_id;
  RETURN new_request_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.respond_to_friend_request(request_id UUID, accept_request BOOLEAN)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_row public.friend_requests%ROWTYPE;
BEGIN
  SELECT * INTO request_row FROM public.friend_requests
  WHERE id = request_id AND addressee_id = auth.uid() AND status = 'pending'
  FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Anfrage nicht gefunden oder bereits beantwortet.'; END IF;

  UPDATE public.friend_requests
  SET status = CASE WHEN accept_request THEN 'accepted' ELSE 'declined' END,
      responded_at = now()
  WHERE id = request_id;

  IF accept_request THEN
    INSERT INTO public.friendships (user_a, user_b)
    VALUES (LEAST(request_row.requester_id, request_row.addressee_id), GREATEST(request_row.requester_id, request_row.addressee_id))
    ON CONFLICT (user_a, user_b) DO NOTHING;
    RETURN 'accepted';
  END IF;
  RETURN 'declined';
END;
$$;

CREATE OR REPLACE FUNCTION public.respond_to_challenge_request(request_id UUID, accept_request BOOLEAN)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_row public.challenge_requests%ROWTYPE;
BEGIN
  SELECT * INTO request_row FROM public.challenge_requests
  WHERE id = request_id AND invitee_id = auth.uid() AND status = 'pending'
  FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Challenge-Anfrage nicht gefunden oder bereits beantwortet.'; END IF;

  UPDATE public.challenge_requests
  SET status = CASE WHEN accept_request THEN 'accepted' ELSE 'declined' END,
      responded_at = now()
  WHERE id = request_id;

  IF accept_request THEN
    INSERT INTO public.challenges (
      request_id, challenger_id, opponent_id, template_key, title,
      duration_days, daily_goal, goal_unit, ends_on
    ) VALUES (
      request_row.id, request_row.challenger_id, request_row.invitee_id,
      request_row.template_key, request_row.title, request_row.duration_days,
      request_row.daily_goal, request_row.goal_unit,
      CURRENT_DATE + (request_row.duration_days - 1)
    );
    RETURN 'accepted';
  END IF;
  RETURN 'declined';
END;
$$;

REVOKE ALL ON FUNCTION public.send_friend_request(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.respond_to_friend_request(UUID, BOOLEAN) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.respond_to_challenge_request(UUID, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.send_friend_request(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.respond_to_friend_request(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.respond_to_challenge_request(UUID, BOOLEAN) TO authenticated;
