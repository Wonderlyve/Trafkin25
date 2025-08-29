
-- Créer une table pour les annonces de mise à jour
CREATE TABLE public.update_announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  update_link TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ajouter RLS (Row Level Security)
ALTER TABLE public.update_announcements ENABLE ROW LEVEL SECURITY;

-- Politique pour que tout le monde puisse voir les annonces actives
CREATE POLICY "Everyone can view active update announcements" 
  ON public.update_announcements 
  FOR SELECT 
  USING (is_active = true OR get_current_user_role() = 'admin'::text);

-- Politique pour que seuls les admins puissent gérer les annonces
CREATE POLICY "Only admins can manage update announcements" 
  ON public.update_announcements 
  FOR ALL 
  USING (get_current_user_role() = 'admin'::text)
  WITH CHECK (get_current_user_role() = 'admin'::text);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_update_announcements_updated_at
  BEFORE UPDATE ON public.update_announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
