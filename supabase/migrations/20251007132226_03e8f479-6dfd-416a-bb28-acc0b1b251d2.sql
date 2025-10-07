-- Add foreign key relationship between event_registrations and events
ALTER TABLE public.event_registrations
ADD CONSTRAINT event_registrations_event_id_fkey
FOREIGN KEY (event_id)
REFERENCES public.events(id)
ON DELETE CASCADE;