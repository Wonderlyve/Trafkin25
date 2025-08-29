-- Ajouter le champ video_url à la table police_announcements
ALTER TABLE public.police_announcements 
ADD COLUMN video_url text;

-- Créer un bucket de stockage pour les vidéos d'annonces police si il n'existe pas déjà
INSERT INTO storage.buckets (id, name, public) 
VALUES ('police-announcements', 'police-announcements', true)
ON CONFLICT (id) DO NOTHING;

-- Créer les politiques RLS pour le bucket police-announcements
CREATE POLICY "Police can upload announcement videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'police-announcements' AND auth.uid() IS NOT NULL);

CREATE POLICY "Everyone can view announcement videos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'police-announcements');

CREATE POLICY "Police can update announcement videos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'police-announcements' AND auth.uid() IS NOT NULL);

CREATE POLICY "Police can delete announcement videos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'police-announcements' AND auth.uid() IS NOT NULL);