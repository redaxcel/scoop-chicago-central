-- Insert profile records for the sample users
INSERT INTO public.profiles (user_id, display_name, role)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Admin User', 'admin'),
  ('22222222-2222-2222-2222-222222222222', 'Ice Cream Lover', 'user'),
  ('33333333-3333-3333-3333-333333333333', 'Shop Owner', 'user')
ON CONFLICT (user_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  role = EXCLUDED.role;

-- Update the shop owner reference
UPDATE public.ice_cream_shops 
SET owner_profile_id = (
  SELECT id FROM public.profiles WHERE user_id = '33333333-3333-3333-3333-333333333333'
)
WHERE name = 'Sweet Scoops';