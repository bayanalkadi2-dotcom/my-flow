-- Share only a small public profile with confirmed friends and pending contacts.
DROP FUNCTION IF EXISTS public.get_social_profiles(UUID[]);
CREATE FUNCTION public.get_social_profiles(requested_profile_ids UUID[])
RETURNS TABLE (id UUID, display_name TEXT, avatar_url TEXT, growth_points INTEGER)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT profile.id,
         COALESCE(NULLIF(TRIM(profile.display_name), ''), SPLIT_PART(profile.email, '@', 1))::TEXT,
         NULLIF(TRIM(profile.avatar_url), '')::TEXT,
         GREATEST(COALESCE(profile.growth_points, 0), 0)::INTEGER
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
