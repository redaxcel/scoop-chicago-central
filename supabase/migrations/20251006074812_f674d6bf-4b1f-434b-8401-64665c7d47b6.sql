-- Replace unsafe self-referential policy with secure function-based policy
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

-- Function to check role without triggering policy recursion
CREATE OR REPLACE FUNCTION public.has_profile_role(_uid uuid, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = _uid
      AND p.role = _role
  );
$$;

-- Allow admins and moderators to update any profile (including role/shop assignment)
CREATE POLICY "Admins and moderators can update any profile"
ON public.profiles
FOR UPDATE
USING (
  public.has_profile_role(auth.uid(), 'admin') OR public.has_profile_role(auth.uid(), 'moderator')
)
WITH CHECK (
  public.has_profile_role(auth.uid(), 'admin') OR public.has_profile_role(auth.uid(), 'moderator')
);