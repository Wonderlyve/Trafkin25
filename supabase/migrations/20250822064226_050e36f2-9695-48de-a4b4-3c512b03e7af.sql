-- Créer une fonction pour automatiquement enregistrer l'heure de mise en ligne
CREATE OR REPLACE FUNCTION public.handle_video_goes_live()
RETURNS TRIGGER AS $$
BEGIN
  -- Si la vidéo passe à is_live = true et qu'il n'y a pas encore d'entrée dans streaming_timer
  IF NEW.is_live = true AND OLD.is_live = false THEN
    INSERT INTO public.streaming_timer (video_schedule_id, actual_start_time)
    VALUES (NEW.id, now())
    ON CONFLICT (video_schedule_id) DO UPDATE SET
      actual_start_time = now(),
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger pour enregistrer automatiquement l'heure de mise en ligne
CREATE TRIGGER trigger_video_goes_live
  AFTER UPDATE ON public.video_schedule
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_video_goes_live();

-- Ajouter une contrainte unique pour éviter les doublons
ALTER TABLE public.streaming_timer 
ADD CONSTRAINT unique_video_schedule_timer 
UNIQUE (video_schedule_id);