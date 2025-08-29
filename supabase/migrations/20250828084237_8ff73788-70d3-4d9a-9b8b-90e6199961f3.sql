-- Ajouter des coordonnées géographiques aux hot spots existants pour les positionner autour de Kinshasa
UPDATE public.hot_spots 
SET 
  latitude = -4.3196 + (RANDOM() - 0.5) * 0.05,
  longitude = 15.3075 + (RANDOM() - 0.5) * 0.05,
  address = CASE 
    WHEN name = 'Quartier 1' THEN 'Quartier 1, Kinshasa'
    WHEN name = '24 novembre' THEN 'Avenue 24 novembre, Kinshasa'
    WHEN name = 'Nzela mayi' THEN 'Nzela mayi, Kinshasa'
    WHEN name = 'Bara moto' THEN 'Bara moto, Kinshasa'
    WHEN name = 'Pascal' THEN 'Pascal, Masina, Kinshasa'
    ELSE name || ', Kinshasa'
  END
WHERE latitude IS NULL OR longitude IS NULL;