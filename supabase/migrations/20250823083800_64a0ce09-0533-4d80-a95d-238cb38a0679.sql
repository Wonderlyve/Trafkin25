-- Ajouter le champ traffic_status à la table video_schedule pour permettre à l'admin de définir l'état de circulation lors de la programmation
ALTER TABLE public.video_schedule 
ADD COLUMN traffic_status text CHECK (traffic_status IN ('bouchon', 'fluide', 'charge'));

-- Créer un trigger pour mettre à jour l'état de circulation du hot spot quand une vidéo est programmée avec un statut
CREATE OR REPLACE FUNCTION public.update_hot_spot_traffic_on_schedule()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Mettre à jour le traffic_status du hot spot associé si un statut est défini
  IF NEW.traffic_status IS NOT NULL THEN
    UPDATE public.hot_spots 
    SET traffic_status = NEW.traffic_status,
        updated_at = now()
    FROM public.videos 
    WHERE videos.id = NEW.video_id 
      AND hot_spots.id = videos.hot_spot_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Créer le trigger
CREATE TRIGGER trigger_update_hot_spot_traffic
    AFTER INSERT OR UPDATE ON public.video_schedule
    FOR EACH ROW
    EXECUTE FUNCTION public.update_hot_spot_traffic_on_schedule();