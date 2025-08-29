-- Corriger la fonction handle_video_goes_live avec search_path sécurisé
CREATE OR REPLACE FUNCTION public.handle_video_goes_live()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;