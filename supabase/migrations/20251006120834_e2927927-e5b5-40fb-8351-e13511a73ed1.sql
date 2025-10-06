-- ============================================================
-- CRITICAL SECURITY FIX: Implement Proper RBAC
-- Move roles from profiles table to separate user_roles table
-- ============================================================

-- Step 1: Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Step 2: Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE (user_id, role)
);

-- Step 3: Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 4: Migrate existing role data from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, role::text::app_role 
FROM public.profiles 
WHERE role IS NOT NULL;

-- Step 5: Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- Step 6: Add RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Step 7: Update profiles table - restrict public access (CRITICAL FIX)
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Step 8: Update all existing RLS policies that reference profiles.role

-- Update profiles policies
DROP POLICY IF EXISTS "Admins and moderators can update any profile" ON public.profiles;
CREATE POLICY "Admins and moderators can update any profile"
ON public.profiles
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'moderator')
);

-- Update contact_inquiries policies
DROP POLICY IF EXISTS "Admins can view inquiries" ON public.contact_inquiries;
CREATE POLICY "Admins can view inquiries"
ON public.contact_inquiries
FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'moderator')
);

-- Update coupons policies
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;
CREATE POLICY "Admins can manage coupons"
ON public.coupons
FOR ALL
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'moderator')
);

-- Update event_registrations policies
DROP POLICY IF EXISTS "Admins can manage registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Admins can view all registrations" ON public.event_registrations;

CREATE POLICY "Admins can manage registrations"
ON public.event_registrations
FOR ALL
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'moderator')
);

-- SECURITY FIX: Prevent public access to event registrations
CREATE POLICY "Only authenticated users can view registrations"
ON public.event_registrations
FOR SELECT
USING (
  auth.uid() = user_id OR
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'moderator')
);

-- Update events policies
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
CREATE POLICY "Admins can manage events"
ON public.events
FOR ALL
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'moderator')
);

-- Update ice_cream_shops policies
DROP POLICY IF EXISTS "Admins can manage all shops" ON public.ice_cream_shops;
CREATE POLICY "Admins can manage all shops"
ON public.ice_cream_shops
FOR ALL
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'moderator')
);

-- Update import_logs policies
DROP POLICY IF EXISTS "Admins can view all import logs" ON public.import_logs;
CREATE POLICY "Admins can view all import logs"
ON public.import_logs
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update pages policies
DROP POLICY IF EXISTS "Admins can manage all pages" ON public.pages;
CREATE POLICY "Admins can manage all pages"
ON public.pages
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update reviews policies
DROP POLICY IF EXISTS "Admins can manage reviews" ON public.reviews;
CREATE POLICY "Admins can manage reviews"
ON public.reviews
FOR ALL
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'moderator')
);

-- Update shop_submissions policies
DROP POLICY IF EXISTS "Admins can update submissions" ON public.shop_submissions;
DROP POLICY IF EXISTS "Admins can view submissions" ON public.shop_submissions;

CREATE POLICY "Admins can manage submissions"
ON public.shop_submissions
FOR ALL
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'moderator')
);

-- Step 9: Remove role column from profiles (no longer needed)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- Step 10: Drop old has_profile_role function as it's replaced by has_role
DROP FUNCTION IF EXISTS public.has_profile_role(uuid, user_role);