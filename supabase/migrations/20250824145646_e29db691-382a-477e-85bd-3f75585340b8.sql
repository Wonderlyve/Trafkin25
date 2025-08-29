-- Temporarily allow all authenticated users to manage ads until proper admin setup
DROP POLICY IF EXISTS "Only admins can manage ads" ON ads;

CREATE POLICY "Authenticated users can manage ads" 
ON ads 
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Also allow authenticated users to upload images
DROP POLICY IF EXISTS "Admin can upload ad images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update ad images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete ad images" ON storage.objects;

CREATE POLICY "Authenticated users can upload ad images" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'ad-images');

CREATE POLICY "Authenticated users can update ad images" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (bucket_id = 'ad-images');

CREATE POLICY "Authenticated users can delete ad images" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (bucket_id = 'ad-images');