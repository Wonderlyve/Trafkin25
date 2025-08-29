-- Add image_url column to hot_spots table
ALTER TABLE public.hot_spots 
ADD COLUMN image_url text;

-- Create storage bucket for hot spot images
INSERT INTO storage.buckets (id, name, public) VALUES ('hot-spots', 'hot-spots', true);

-- Create policies for hot spot images
CREATE POLICY "Hot spot images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'hot-spots');

CREATE POLICY "Admins can upload hot spot images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'hot-spots' AND (get_current_user_role() = 'admin'));

CREATE POLICY "Admins can update hot spot images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'hot-spots' AND (get_current_user_role() = 'admin'));

CREATE POLICY "Admins can delete hot spot images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'hot-spots' AND (get_current_user_role() = 'admin'));