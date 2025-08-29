-- Table pour stocker l'heure exacte et la date de publication des vidéos
CREATE TABLE public.video_publications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_by UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Assurer qu'une vidéo ne peut être publiée qu'une seule fois
  UNIQUE(video_id)
);

-- Activer RLS
ALTER TABLE public.video_publications ENABLE ROW LEVEL SECURITY;

-- Politique pour voir les publications
CREATE POLICY "Everyone can view publications" 
ON public.video_publications 
FOR SELECT 
USING (true);

-- Politique pour créer des publications (admins seulement)
CREATE POLICY "Only admins can create publications" 
ON public.video_publications 
FOR INSERT 
WITH CHECK (get_current_user_role() = 'admin');

-- Politique pour modifier des publications (admins seulement)
CREATE POLICY "Only admins can update publications" 
ON public.video_publications 
FOR UPDATE 
USING (get_current_user_role() = 'admin');

-- Index pour optimiser les requêtes
CREATE INDEX idx_video_publications_published_at ON public.video_publications(published_at DESC);
CREATE INDEX idx_video_publications_video_id ON public.video_publications(video_id);

-- Trigger pour mettre à jour le statut de la vidéo quand elle est publiée
CREATE OR REPLACE FUNCTION public.update_video_status_on_publication()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour le statut de la vidéo à 'live' quand elle est publiée
  UPDATE public.videos 
  SET status = 'live' 
  WHERE id = NEW.video_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_video_status_on_publication
  AFTER INSERT ON public.video_publications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_video_status_on_publication();