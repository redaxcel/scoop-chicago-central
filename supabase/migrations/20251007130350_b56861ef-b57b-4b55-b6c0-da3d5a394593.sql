-- Ensure RLS is enabled on contact_inquiries
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Drop the existing admin policy if it exists and recreate it properly
DROP POLICY IF EXISTS "Admins can view inquiries" ON public.contact_inquiries;

-- Create a clear, restrictive SELECT policy for admins and moderators only
CREATE POLICY "Only admins and moderators can view contact inquiries"
ON public.contact_inquiries
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'moderator'::app_role)
);

-- Ensure the INSERT policy allows anyone to create inquiries (existing behavior)
DROP POLICY IF EXISTS "Anyone can create inquiries" ON public.contact_inquiries;

CREATE POLICY "Anyone can submit contact inquiries"
ON public.contact_inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (true);