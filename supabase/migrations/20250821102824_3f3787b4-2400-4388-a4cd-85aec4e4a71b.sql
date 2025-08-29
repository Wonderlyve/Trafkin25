-- Rendre le bucket videos public pour permettre la lecture des vidéos
UPDATE storage.buckets 
SET public = true 
WHERE id = 'videos';

-- Créer les politiques RLS pour l'accès aux vidéos
CREATE POLICY "Allow public access to videos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'videos');

-- Politique pour permettre aux utilisateurs d'uploader des vidéos
CREATE POLICY "Allow authenticated users to upload videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'videos' AND auth.uid() IS NOT NULL);

-- Politique pour permettre aux administrateurs de gérer toutes les vidéos
CREATE POLICY "Allow admins to manage all videos" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'videos' AND EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));