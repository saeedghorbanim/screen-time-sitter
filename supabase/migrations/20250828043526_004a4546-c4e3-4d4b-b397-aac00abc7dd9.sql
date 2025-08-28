-- Add RLS policy to allow viewing profiles for leaderboard purposes
CREATE POLICY "Users can view profiles for leaderboards" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 
    FROM public.daily_usage 
    WHERE daily_usage.user_id = profiles.user_id
  )
);