
-- Supprimer l'ancienne contrainte sur le rôle
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Ajouter une nouvelle contrainte qui inclut le rôle 'police'
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('user', 'admin', 'relay', 'police'));
