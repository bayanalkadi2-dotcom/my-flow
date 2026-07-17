-- Allow either participant to end their own friendship.
GRANT DELETE ON TABLE public.friendships TO authenticated;

DROP POLICY IF EXISTS "Users can delete own friendships" ON public.friendships;
CREATE POLICY "Users can delete own friendships"
  ON public.friendships
  FOR DELETE
  TO authenticated
  USING (auth.uid() IN (user_a, user_b));
