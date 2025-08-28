-- Fix critical security vulnerability in subscribers table
-- Remove email-based access and restrict to user_id only

-- Drop all existing policies on subscribers table
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can view their own subscription by user_id" ON public.subscribers;
DROP POLICY IF EXISTS "Users can insert their own subscription by user_id" ON public.subscribers;
DROP POLICY IF EXISTS "Users can update their own subscription by user_id" ON public.subscribers;

-- Create new secure policies that only allow access based on user_id matching
CREATE POLICY "secure_select_own_subscription" ON public.subscribers
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "secure_insert_own_subscription" ON public.subscribers
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "secure_update_own_subscription" ON public.subscribers
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Edge functions using service role key bypass RLS and can still manage subscriptions