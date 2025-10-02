-- Add SEO and gallery fields to events table
ALTER TABLE events
ADD COLUMN seo_title TEXT,
ADD COLUMN seo_description TEXT,
ADD COLUMN seo_keywords TEXT,
ADD COLUMN gallery_images TEXT[];

-- Add SEO and image fields to coupons table
ALTER TABLE coupons
ADD COLUMN seo_title TEXT,
ADD COLUMN seo_description TEXT,
ADD COLUMN seo_keywords TEXT,
ADD COLUMN image_url TEXT,
ADD COLUMN gallery_images TEXT[];