-- Ajouter le champ traffic_status à la table hot_spots
ALTER TABLE public.hot_spots 
ADD COLUMN traffic_status text CHECK (traffic_status IN ('bouchon', 'fluide', 'charge'));

-- Créer un index pour de meilleures performances
CREATE INDEX idx_hot_spots_traffic_status ON public.hot_spots(traffic_status);