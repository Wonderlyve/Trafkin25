-- Add video support to posts table
ALTER TABLE public.posts 
ADD COLUMN video_url TEXT;