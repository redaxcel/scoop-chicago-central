-- First, let's create actual test users with proper passwords
-- Note: In production, users would sign up normally, but for testing we'll create them directly

-- Delete existing test users and start fresh
DELETE FROM auth.users WHERE email IN ('admin@icecreamchicago.com', 'user@example.com', 'shop@example.com');

-- Insert test users with proper authentication
-- Password for all test accounts will be: "password123"
-- This is the encrypted version of "password123" using bcrypt
INSERT INTO auth.users (
  id, 
  instance_id, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  created_at, 
  updated_at, 
  raw_user_meta_data,
  aud,
  role
) VALUES 
  (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'admin@icecreamchicago.com',
    '$2a$10$3euKcZLVpBUYHLUHRyh2N.VFiIzFjOUKiXRLhX3sSdYhYgE5dKlz.',
    now(),
    now(),
    now(),
    '{"display_name": "Admin User"}',
    'authenticated',
    'authenticated'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'user@example.com',
    '$2a$10$3euKcZLVpBUYHLUHRyh2N.VFiIzFjOUKiXRLhX3sSdYhYgE5dKlz.',
    now(),
    now(),
    now(),
    '{"display_name": "Ice Cream Lover"}',
    'authenticated',
    'authenticated'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    '00000000-0000-0000-0000-000000000000',
    'shop@example.com',
    '$2a$10$3euKcZLVpBUYHLUHRyh2N.VFiIzFjOUKiXRLhX3sSdYhYgE5dKlz.',
    now(),
    now(),
    now(),
    '{"display_name": "Shop Owner"}',
    'authenticated',
    'authenticated'
  );

-- Update profiles for these users
INSERT INTO public.profiles (user_id, display_name, role)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Admin User', 'admin'),
  ('22222222-2222-2222-2222-222222222222', 'Ice Cream Lover', 'user'),
  ('33333333-3333-3333-3333-333333333333', 'Shop Owner', 'user')
ON CONFLICT (user_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  role = EXCLUDED.role;

-- Create a new enum for page types
CREATE TYPE page_type AS ENUM ('home', 'about', 'contact', 'custom');

-- Create pages table for SEO management
CREATE TABLE public.pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  meta_description TEXT,
  meta_keywords TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  page_type page_type DEFAULT 'custom',
  content TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS on pages
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Create policies for pages
CREATE POLICY "Anyone can view published pages"
ON public.pages
FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins can manage all pages"
ON public.pages
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create import_logs table for tracking imports
CREATE TABLE public.import_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  import_type TEXT NOT NULL, -- 'shops', 'events', 'coupons'
  total_records INTEGER NOT NULL DEFAULT 0,
  successful_records INTEGER NOT NULL DEFAULT 0,
  failed_records INTEGER NOT NULL DEFAULT 0,
  errors TEXT[], -- Array of error messages
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS on import_logs
ALTER TABLE public.import_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for import_logs
CREATE POLICY "Admins can view all import logs"
ON public.import_logs
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Add triggers for updated_at
CREATE TRIGGER update_pages_updated_at
BEFORE UPDATE ON public.pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default pages
INSERT INTO public.pages (slug, title, meta_description, page_type, content, created_by)
SELECT 
  'home',
  'Ice Cream Chicago - Best Ice Cream Shops in the Windy City',
  'Discover the best ice cream shops in Chicago. Find local favorites, read reviews, and explore unique flavors across the city.',
  'home',
  'Welcome to Ice Cream Chicago, your ultimate guide to the best frozen treats in the Windy City!',
  id
FROM public.profiles WHERE role = 'admin' LIMIT 1;

INSERT INTO public.pages (slug, title, meta_description, page_type, content, created_by)
SELECT 
  'about',
  'About Ice Cream Chicago - Our Mission',
  'Learn about Ice Cream Chicago''s mission to connect ice cream lovers with the best local shops and experiences.',
  'about',
  'Ice Cream Chicago is dedicated to celebrating the rich ice cream culture of our beloved city.',
  id
FROM public.profiles WHERE role = 'admin' LIMIT 1;