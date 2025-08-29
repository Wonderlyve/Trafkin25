-- Mettre à jour la contrainte du type de publicité pour inclure 'native_card'
-- D'abord, supprimer l'ancienne contrainte s'il y en a une
ALTER TABLE ads DROP CONSTRAINT IF EXISTS ads_ad_type_check;

-- Ajouter la nouvelle contrainte avec tous les types
ALTER TABLE ads ADD CONSTRAINT ads_ad_type_check 
CHECK (ad_type IN ('banner', 'stream_overlay', 'sidebar', 'native_card'));