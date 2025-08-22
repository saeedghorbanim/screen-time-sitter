-- Insert sample testimonials to demonstrate the feature
INSERT INTO public.testimonials (user_id, title, content, rating, is_featured, is_approved) VALUES
(
  '478cce5e-cdc8-48e8-94f5-4cf95547ad23', 
  'Reduced my screen time by 50%!', 
  'This app has been a game-changer for my digital wellness. I used to spend 6+ hours on my phone daily, but with MindfulTime, I''ve cut it down to just 3 hours. The gentle reminders and progress tracking really help me stay mindful of my usage.', 
  5, 
  true, 
  true
),
(
  '478cce5e-cdc8-48e8-94f5-4cf95547ad23',
  'Better sleep and focus', 
  'Since using MindfulTime, I''ve noticed significant improvements in my sleep quality and ability to focus during work. The app helped me realize how much time I was wasting on social media before bed.', 
  5, 
  false, 
  true
),
(
  '478cce5e-cdc8-48e8-94f5-4cf95547ad23',
  'Accountability with friends works!', 
  'The buddy feature is amazing! Having my friend track progress with me makes it so much easier to stick to my screen time goals. We motivate each other daily.', 
  4, 
  true, 
  true
),
(
  '478cce5e-cdc8-48e8-94f5-4cf95547ad23',
  'More time for hobbies', 
  'I''ve rediscovered my love for reading and cooking thanks to MindfulTime. The time I used to spend mindlessly scrolling is now spent on activities that actually fulfill me.', 
  5, 
  false, 
  true
);