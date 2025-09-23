-- Update profiles table to better handle shop ownership
ALTER TABLE public.profiles 
ADD COLUMN shop_id UUID REFERENCES public.ice_cream_shops(id);

-- Update ice_cream_shops to link to user profiles for ownership
ALTER TABLE public.ice_cream_shops
ADD COLUMN owner_profile_id UUID REFERENCES public.profiles(id);

-- Create sample users with different roles
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'admin@icecreamchicago.com', '$2a$10$example_hash', now(), now(), now(), '{"display_name": "Admin User", "role": "admin"}'),
  ('22222222-2222-2222-2222-222222222222', 'user@example.com', '$2a$10$example_hash', now(), now(), now(), '{"display_name": "Ice Cream Lover", "role": "user"}'),
  ('33333333-3333-3333-3333-333333333333', 'shop@example.com', '$2a$10$example_hash', now(), now(), now(), '{"display_name": "Shop Owner", "role": "user"}');

-- Update existing shop to have an owner
UPDATE public.ice_cream_shops 
SET owner_profile_id = (SELECT id FROM public.profiles WHERE user_id = '33333333-3333-3333-3333-333333333333')
WHERE name = 'Sweet Scoops';

-- Add coordinates to existing shops for map display
UPDATE public.ice_cream_shops SET
  latitude = 41.8781,
  longitude = -87.6298
WHERE name = 'Sweet Scoops';

UPDATE public.ice_cream_shops SET
  latitude = 41.9742,
  longitude = -87.6553
WHERE name = 'Creamy Delights';

UPDATE public.ice_cream_shops SET
  latitude = 41.8369,
  longitude = -87.6847
WHERE name = 'Frozen Paradise';

-- Update RLS policies for shop owners
CREATE POLICY "Shop owners can update their shops"
ON public.ice_cream_shops
FOR UPDATE
USING (
  owner_profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Policy for shop owners to view their shop even if pending
CREATE POLICY "Shop owners can view their shops"
ON public.ice_cream_shops
FOR SELECT
USING (
  owner_profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
  OR status = 'active'::shop_status 
  OR status = 'pending'::shop_status
);