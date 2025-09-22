-- Ice Cream Chicago Directory Database Schema

-- Create enum for pricing levels
CREATE TYPE price_level AS ENUM ('$', '$$', '$$$', '$$$$');

-- Create enum for shop status
CREATE TYPE shop_status AS ENUM ('active', 'pending', 'closed', 'suspended');

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'moderator', 'user');

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role user_role DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ice cream shops table
CREATE TABLE public.ice_cream_shops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  phone TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Chicago',
  state TEXT NOT NULL DEFAULT 'IL',
  zip_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  pricing price_level,
  website_url TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  twitter_url TEXT,
  hours JSONB, -- Store opening hours as JSON
  amenities TEXT[], -- Array of amenities like "parking", "outdoor_seating", etc.
  image_url TEXT,
  gallery_images TEXT[], -- Array of image URLs
  featured BOOLEAN DEFAULT false,
  status shop_status DEFAULT 'pending',
  owner_email TEXT,
  owner_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES public.ice_cream_shops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT NOT NULL,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(shop_id, user_id) -- One review per user per shop
);

-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  shop_id UUID REFERENCES public.ice_cream_shops(id) ON DELETE CASCADE,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  image_url TEXT,
  registration_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coupons/deals table
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES public.ice_cream_shops(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  discount_percent INTEGER,
  discount_amount DECIMAL(10, 2),
  coupon_code TEXT,
  terms_conditions TEXT,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  usage_limit INTEGER,
  current_usage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contact inquiries table
CREATE TABLE public.contact_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shop submission requests
CREATE TABLE public.shop_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Chicago',
  state TEXT NOT NULL DEFAULT 'IL',
  zip_code TEXT,
  website_url TEXT,
  description TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ice_cream_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_submissions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Ice cream shops policies (public read, admin write)
CREATE POLICY "Anyone can view active shops" ON public.ice_cream_shops 
  FOR SELECT USING (status = 'active' OR status = 'pending');

CREATE POLICY "Admins can manage all shops" ON public.ice_cream_shops 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- Events policies
CREATE POLICY "Anyone can view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admins can manage events" ON public.events 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Coupons policies  
CREATE POLICY "Anyone can view active coupons" ON public.coupons 
  FOR SELECT USING (is_active = true AND valid_until > now());
CREATE POLICY "Admins can manage coupons" ON public.coupons 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Contact inquiries policies
CREATE POLICY "Anyone can create inquiries" ON public.contact_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view inquiries" ON public.contact_inquiries 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Shop submissions policies
CREATE POLICY "Anyone can submit shops" ON public.shop_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view submissions" ON public.shop_submissions 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );
CREATE POLICY "Admins can update submissions" ON public.shop_submissions 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ice_cream_shops_updated_at
    BEFORE UPDATE ON public.ice_cream_shops
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at
    BEFORE UPDATE ON public.coupons
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'display_name');
  RETURN new;
END;
$$;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data
INSERT INTO public.ice_cream_shops (name, description, phone, address, city, latitude, longitude, pricing, website_url, instagram_url, status, hours, amenities) VALUES 
('Sweet Scoops Downtown', 'Artisanal ice cream made fresh daily with locally sourced ingredients. Our signature flavors include Chicago Deep Dish and Windy City Vanilla.', '(312) 555-0123', '123 N Michigan Ave', 'Chicago', 41.8781, -87.6298, '$$', 'https://sweetscoops.com', 'https://instagram.com/sweetscoops', 'active', '{"monday": "10:00-22:00", "tuesday": "10:00-22:00", "wednesday": "10:00-22:00", "thursday": "10:00-22:00", "friday": "10:00-23:00", "saturday": "09:00-23:00", "sunday": "11:00-21:00"}', ARRAY['outdoor_seating', 'wifi', 'parking', 'vegan_options']);

INSERT INTO public.events (title, description, event_date, location, is_featured) VALUES 
('Chicago Ice Cream Festival 2024', 'Join us for the annual Chicago Ice Cream Festival featuring over 30 local ice cream shops, live music, and family activities!', '2024-07-15 12:00:00+00', 'Millennium Park, Chicago', true);

INSERT INTO public.coupons (shop_id, title, description, discount_percent, coupon_code, valid_from, valid_until, terms_conditions) 
SELECT id, '20% Off First Visit', 'Get 20% off your first order at Sweet Scoops!', 20, 'FIRST20', now(), now() + INTERVAL '30 days', 'Valid for new customers only. Cannot be combined with other offers.'
FROM public.ice_cream_shops WHERE name = 'Sweet Scoops Downtown';