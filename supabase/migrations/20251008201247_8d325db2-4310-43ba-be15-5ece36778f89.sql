-- Add shop response field to reviews table
ALTER TABLE public.reviews
ADD COLUMN shop_response TEXT,
ADD COLUMN shop_response_date TIMESTAMP WITH TIME ZONE;

-- Update RLS policy to allow shop owners to respond to reviews on their shops
CREATE POLICY "Shop owners can respond to reviews on their shops"
ON public.reviews
FOR UPDATE
USING (
  shop_id IN (
    SELECT id FROM public.ice_cream_shops
    WHERE owner_profile_id IN (
      SELECT id FROM public.profiles
      WHERE user_id = auth.uid()
    )
  )
);