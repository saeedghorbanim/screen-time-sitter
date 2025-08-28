-- Fix critical security vulnerability in subscribers table
-- Current policies allow access based on email matching which could be exploited
-- Restrict access to only records where user_id matches authenticated user

-- Drop the existing overly permissive policies that allow email-based access
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;

-- Create secure SELECT policy - users can only view their own subscription records by user_id
CREATE POLICY "Users can view their own subscription by user_id" ON public.subscribers
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create secure INSERT policy - users can only create their own subscription records by user_id
CREATE POLICY "Users can insert their own subscription by user_id" ON public.subscribers
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create secure UPDATE policy - users can only update their own subscription records by user_id
CREATE POLICY "Users can update their own subscription by user_id" ON public.subscribers
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Note: Edge functions using service role key will bypass RLS entirely
-- This maintains Stripe integration functionality while securing user access