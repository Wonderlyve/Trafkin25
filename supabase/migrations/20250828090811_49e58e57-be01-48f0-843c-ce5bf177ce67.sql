-- Ajouter les colonnes pour supporter les Native ads
ALTER TABLE public.posts 
ADD COLUMN is_sponsored BOOLEAN DEFAULT false,
ADD COLUMN sponsor_url TEXT;