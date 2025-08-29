-- Supprimer la contrainte actuelle
ALTER TABLE public.posts DROP CONSTRAINT posts_type_check;

-- Créer la nouvelle contrainte avec 'native_ads' inclus
ALTER TABLE public.posts ADD CONSTRAINT posts_type_check 
CHECK (type IN ('traffic', 'incident', 'event', 'flood', 'construction', 'noise', 'info', 'native_ads'));