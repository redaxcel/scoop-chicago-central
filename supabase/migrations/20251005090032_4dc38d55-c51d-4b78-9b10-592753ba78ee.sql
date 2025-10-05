-- Add latitude and longitude to events table for map location
ALTER TABLE public.events
ADD COLUMN latitude NUMERIC,
ADD COLUMN longitude NUMERIC;