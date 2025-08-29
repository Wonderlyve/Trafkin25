-- Create bucket for ad images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ad-images', 'ad-images', true);

-- Create policy for ad images
CREATE POLICY "Admin can upload ad images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'ad-images' AND get_current_user_role() = 'admin');

CREATE POLICY "Admin can update ad images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'ad-images' AND get_current_user_role() = 'admin');

CREATE POLICY "Admin can delete ad images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'ad-images' AND get_current_user_role() = 'admin');

CREATE POLICY "Everyone can view ad images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'ad-images');