-- Add SEO and link follow controls to shops
ALTER TABLE public.ice_cream_shops
  ADD COLUMN IF NOT EXISTS website_follow boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS seo_keywords text;

-- Add moderation status to reviews
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Allow admins/moderators to manage reviews (select/insert/update/delete)
DROP POLICY IF EXISTS "Admins can manage reviews" ON public.reviews;
CREATE POLICY "Admins can manage reviews"
ON public.reviews
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('admin','moderator')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('admin','moderator')
  )
);

-- Event registrations for tracking attendees
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  user_id uuid NULL,
  name text,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Policies for event_registrations
DROP POLICY IF EXISTS "Anyone can register for events" ON public.event_registrations;
CREATE POLICY "Anyone can register for events"
ON public.event_registrations FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all registrations" ON public.event_registrations;
CREATE POLICY "Admins can view all registrations"
ON public.event_registrations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('admin','moderator')
  )
);

DROP POLICY IF EXISTS "Users can view their registrations" ON public.event_registrations;
CREATE POLICY "Users can view their registrations"
ON public.event_registrations FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage registrations" ON public.event_registrations;
CREATE POLICY "Admins can manage registrations"
ON public.event_registrations FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('admin','moderator')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('admin','moderator')
  )
);
