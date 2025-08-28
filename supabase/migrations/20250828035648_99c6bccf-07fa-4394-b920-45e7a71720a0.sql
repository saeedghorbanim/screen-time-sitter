-- Fix critical security vulnerability in subscribers table
-- Current policies allow any user to insert/update any subscription data

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;

-- Create secure INSERT policy - users can only create their own subscription records
CREATE POLICY "Users can insert their own subscription" ON public.subscribers
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id OR auth.email() = email
  );

-- Create secure UPDATE policy - users can only update their own subscription records
CREATE POLICY "Users can update their own subscription" ON public.subscribers
  FOR UPDATE 
  USING (
    auth.uid() = user_id OR auth.email() = email
  );

-- Note: Edge functions using service role key will bypass RLS and can still update subscription data
-- This maintains the existing Stripe integration functionality while securing user access