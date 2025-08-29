
-- Vérifier la contrainte actuelle sur le type de post
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'posts'::regclass AND contype = 'c';

-- Supprimer l'ancienne contrainte si elle existe
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_type_check;

-- Créer une nouvelle contrainte qui inclut 'native_ads'
ALTER TABLE public.posts ADD CONSTRAINT posts_type_check 
CHECK (type IN ('traffic', 'incident', 'flood', 'construction', 'event', 'noise', 'native_ads'));
