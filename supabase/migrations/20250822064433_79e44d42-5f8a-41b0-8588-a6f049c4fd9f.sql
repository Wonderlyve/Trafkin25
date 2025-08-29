-- Corriger la fonction update_video_status_on_publication avec search_path sécurisé
CREATE OR REPLACE FUNCTION public.update_video_status_on_publication()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Mettre à jour le statut de la vidéo à 'live' quand elle est publiée
  UPDATE public.videos 
  SET status = 'live' 
  WHERE id = NEW.video_id;
  
  RETURN NEW;
END;
$$;