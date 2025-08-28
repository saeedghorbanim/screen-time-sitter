-- Fix security vulnerability: Restrict profile visibility to authenticated users only
-- Remove the overly permissive policy that allows everyone to view all profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create more secure policies for profile access
-- 1. Allow users to view their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT 
  USING (auth.uid() = user_id);

-- 2. Allow authenticated users to view profiles of their buddies only
CREATE POLICY "Users can view buddy profiles" ON public.profiles
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL AND 
    EXISTS (
      SELECT 1 FROM public.buddies 
      WHERE (
        (buddies.user1_id = auth.uid() AND buddies.user2_id = profiles.user_id) OR
        (buddies.user2_id = auth.uid() AND buddies.user1_id = profiles.user_id)
      )
    )
  );

-- 3. For features that need limited profile data (like buddy requests), 
-- create a more restrictive policy that only shows essential info
CREATE POLICY "Limited profile access for authenticated users" ON public.profiles
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL AND 
    auth.uid() != user_id -- Exclude own profile (covered by first policy)
  );

-- However, the above policy is still too broad. Let's remove it and be more specific.
DROP POLICY IF EXISTS "Limited profile access for authenticated users" ON public.profiles;

-- Instead, create a policy specifically for username searches (like for buddy requests)
-- This only allows viewing username and display_name, not other sensitive data
-- We'll handle this through a database function for better security