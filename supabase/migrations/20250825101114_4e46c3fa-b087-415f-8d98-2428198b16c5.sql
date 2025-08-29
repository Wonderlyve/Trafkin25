-- Créer la table pour les annonces police
CREATE TABLE public.police_announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.police_announcements ENABLE ROW LEVEL SECURITY;

-- Politique pour que tout le monde puisse voir les annonces actives
CREATE POLICY "Everyone can view active police announcements"
ON public.police_announcements 
FOR SELECT 
USING (is_active = true OR get_current_user_role() = ANY(ARRAY['admin'::text, 'police'::text]));

-- Politique pour que seule la police et les admins puissent gérer les annonces
CREATE POLICY "Police can manage announcements"
ON public.police_announcements 
FOR ALL
USING (get_current_user_role() = ANY(ARRAY['admin'::text, 'police'::text]))
WITH CHECK (get_current_user_role() = ANY(ARRAY['admin'::text, 'police'::text]));

-- Trigger pour updated_at
CREATE TRIGGER update_police_announcements_updated_at
BEFORE UPDATE ON public.police_announcements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();