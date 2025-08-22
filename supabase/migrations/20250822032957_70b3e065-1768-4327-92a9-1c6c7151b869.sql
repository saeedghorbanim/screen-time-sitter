-- Add foreign key constraints to buddies table
ALTER TABLE public.buddies 
ADD CONSTRAINT buddies_user1_id_fkey 
FOREIGN KEY (user1_id) REFERENCES public.profiles(user_id);

ALTER TABLE public.buddies 
ADD CONSTRAINT buddies_user2_id_fkey 
FOREIGN KEY (user2_id) REFERENCES public.profiles(user_id);

-- Add foreign key constraints to buddy_requests table
ALTER TABLE public.buddy_requests 
ADD CONSTRAINT buddy_requests_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES public.profiles(user_id);

ALTER TABLE public.buddy_requests 
ADD CONSTRAINT buddy_requests_receiver_id_fkey 
FOREIGN KEY (receiver_id) REFERENCES public.profiles(user_id);