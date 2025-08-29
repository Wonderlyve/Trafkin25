
-- Créer la table streaming_timer pour stocker les heures exactes de mise en ligne
CREATE TABLE public.streaming_timer (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_schedule_id UUID NOT NULL REFERENCES public.video_schedule(id) ON DELETE CASCADE,
  actual_start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur la table
ALTER TABLE public.streaming_timer ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture à tous
CREATE POLICY "Users can view streaming timers" 
  ON public.streaming_timer 
  FOR SELECT 
  USING (true);

-- Politique pour permettre aux admins de gérer les timers
CREATE POLICY "Admins can manage streaming timers" 
  ON public.streaming_timer 
  FOR ALL 
  USING (get_current_user_role() = 'admin'::text);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_streaming_timer_updated_at
  BEFORE UPDATE ON public.streaming_timer
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index pour améliorer les performances
CREATE INDEX idx_streaming_timer_video_schedule_id ON public.streaming_timer(video_schedule_id);
CREATE INDEX idx_streaming_timer_actual_start_time ON public.streaming_timer(actual_start_time);
