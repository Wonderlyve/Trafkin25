-- Create storage bucket for good addresses images
INSERT INTO storage.buckets (id, name, public) VALUES ('good-addresses', 'good-addresses', true);

-- Create RLS policies for good addresses images
CREATE POLICY "Anyone can view good addresses images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'good-addresses');

CREATE POLICY "Authenticated users can upload good addresses images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'good-addresses' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own good addresses images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'good-addresses' AND auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete good addresses images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'good-addresses' AND get_current_user_role() = 'admin');