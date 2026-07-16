-- Repariert bestehende Social-Installationen, bei denen RLS-Policies vorhanden sind,
-- die Tabellenrechte fuer die Rolle "authenticated" aber fehlen.
-- Diese Migration kann gefahrlos mehrfach ausgefuehrt werden.

BEGIN;

ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

GRANT SELECT, DELETE ON TABLE public.friend_requests TO authenticated;
GRANT SELECT ON TABLE public.friendships TO authenticated;
GRANT SELECT ON TABLE public.profiles TO authenticated;

DROP POLICY IF EXISTS "Users can read own friend requests" ON public.friend_requests;
CREATE POLICY "Users can read own friend requests"
  ON public.friend_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

DROP POLICY IF EXISTS "Users can cancel own friend requests" ON public.friend_requests;
CREATE POLICY "Users can cancel own friend requests"
  ON public.friend_requests
  FOR DELETE
  TO authenticated
  USING (auth.uid() = requester_id AND status = 'pending');

DROP POLICY IF EXISTS "Users can read own friendships" ON public.friendships;
CREATE POLICY "Users can read own friendships"
  ON public.friendships
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_a OR auth.uid() = user_b);

DROP POLICY IF EXISTS "Users can read social profiles" ON public.profiles;
CREATE POLICY "Users can read social profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1
      FROM public.friend_requests request
      WHERE (auth.uid() = request.requester_id OR auth.uid() = request.addressee_id)
        AND (id = request.requester_id OR id = request.addressee_id)
    )
    OR EXISTS (
      SELECT 1
      FROM public.friendships friendship
      WHERE (auth.uid() = friendship.user_a OR auth.uid() = friendship.user_b)
        AND (id = friendship.user_a OR id = friendship.user_b)
    )
  );

-- Aeltere Konten koennen vor der display_name-Metadatenuebergabe erstellt worden sein.
-- In diesem Fall wird einmalig der Name aus den Auth-Metadaten bzw. der E-Mail ergaenzt.
UPDATE public.profiles profile
SET display_name = COALESCE(
  NULLIF(TRIM(auth_user.raw_user_meta_data->>'display_name'), ''),
  SPLIT_PART(profile.email, '@', 1)
)
FROM auth.users auth_user
WHERE auth_user.id = profile.id
  AND NULLIF(TRIM(profile.display_name), '') IS NULL;

DROP FUNCTION IF EXISTS public.get_social_profiles(UUID[]);
CREATE FUNCTION public.get_social_profiles(requested_profile_ids UUID[])
RETURNS TABLE (id UUID, display_name TEXT, avatar_url TEXT)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT profile.id,
         COALESCE(NULLIF(TRIM(profile.display_name), ''), SPLIT_PART(profile.email, '@', 1))::TEXT,
         NULLIF(TRIM(profile.avatar_url), '')::TEXT
  FROM public.profiles profile
  WHERE profile.id = ANY(requested_profile_ids)
    AND (
      profile.id = auth.uid()
      OR EXISTS (
        SELECT 1
        FROM public.friend_requests request
        WHERE (auth.uid() = request.requester_id OR auth.uid() = request.addressee_id)
          AND (profile.id = request.requester_id OR profile.id = request.addressee_id)
      )
      OR EXISTS (
        SELECT 1
        FROM public.friendships friendship
        WHERE (auth.uid() = friendship.user_a OR auth.uid() = friendship.user_b)
          AND (profile.id = friendship.user_a OR profile.id = friendship.user_b)
      )
    );
$$;

GRANT EXECUTE ON FUNCTION public.send_friend_request(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.respond_to_friend_request(UUID, BOOLEAN) TO authenticated;
REVOKE ALL ON FUNCTION public.get_social_profiles(UUID[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_social_profiles(UUID[]) TO authenticated;

-- PostgREST soll die neu angelegte RPC-Funktion sofort erkennen.
NOTIFY pgrst, 'reload schema';

COMMIT;
