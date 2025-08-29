-- Create posts table for traffic news/incidents
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name TEXT NOT NULL,
  avatar TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('traffic', 'incident', 'event', 'flood', 'construction', 'noise', 'info')),
  content TEXT NOT NULL,
  image_url TEXT,
  likes INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  shares INTEGER NOT NULL DEFAULT 0,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can view posts" 
ON public.posts 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create posts" 
ON public.posts 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update their own posts" 
ON public.posts 
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own posts" 
ON public.posts 
FOR DELETE 
TO authenticated
USING (user_id = auth.uid());

-- Create updated_at trigger
CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create a likes table for tracking who liked what
CREATE TABLE public.post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS on likes
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for likes
CREATE POLICY "Everyone can view likes" 
ON public.post_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage their likes" 
ON public.post_likes 
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Insert sample data
INSERT INTO public.posts (user_name, avatar, location, type, content, likes, comments, shares, created_at) VALUES
('Jean K.', 'JK', 'Victoire - Rond-point', 'traffic', 'Embouteillage monstre au rond-point Victoire ! Évitez le secteur si possible. Alternative par Boulevard du 30 juin recommandée 🚗', 12, 5, 3, now() - interval '2 minutes'),
('Marie T.', 'MT', 'UPN - Campus', 'incident', 'Accident léger devant UPN, circulation ralentie. Les secours sont sur place. Prudence ! 🚨', 8, 2, 6, now() - interval '15 minutes'),
('Patrick M.', 'PM', 'Debonhomme - Marché', 'info', 'Route fluide vers Debonhomme ce matin ! Parfait pour éviter les bouchons habituels 👍', 23, 8, 4, now() - interval '1 hour'),
('Sarah L.', 'SL', 'Lemba - Université', 'event', 'Manifestation étudiante prévue cet après-midi à Lemba. Plusieurs routes seront fermées. Planifiez vos déplacements ! 📢', 45, 15, 18, now() - interval '2 hours');