-- Enable RLS for all tables
ALTER DATABASE postgres SET "app.settings".'statement_timeout' = '30s';

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
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own daily checkins" ON public.daily_checkins;
CREATE POLICY "Users can create own daily checkins"
ON public.daily_checkins
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own daily checkins" ON public.daily_checkins;
CREATE POLICY "Users can update own daily checkins"
ON public.daily_checkins
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own daily checkins" ON public.daily_checkins;
CREATE POLICY "Users can delete own daily checkins"
ON public.daily_checkins
FOR DELETE
USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_daily_checkins_updated_at ON public.daily_checkins;
CREATE TRIGGER update_daily_checkins_updated_at
  BEFORE UPDATE ON public.daily_checkins
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
