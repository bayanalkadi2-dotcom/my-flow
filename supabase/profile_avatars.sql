BEGIN;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Avatar images are publicly readable" ON storage.objects;
CREATE POLICY "Avatar images are publicly readable"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

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
        SELECT 1 FROM public.friend_requests request
        WHERE (auth.uid() = request.requester_id OR auth.uid() = request.addressee_id)
          AND (profile.id = request.requester_id OR profile.id = request.addressee_id)
      )
      OR EXISTS (
        SELECT 1 FROM public.friendships friendship
        WHERE (auth.uid() = friendship.user_a OR auth.uid() = friendship.user_b)
          AND (profile.id = friendship.user_a OR profile.id = friendship.user_b)
      )
    );
$$;

REVOKE ALL ON FUNCTION public.get_social_profiles(UUID[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_social_profiles(UUID[]) TO authenticated;

NOTIFY pgrst, 'reload schema';

COMMIT;
