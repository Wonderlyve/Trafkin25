-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'relay', 'user')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create hot spots table
CREATE TABLE public.hot_spots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create videos table
CREATE TABLE public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  duration INTEGER, -- in seconds
  hot_spot_id UUID REFERENCES public.hot_spots(id),
  uploaded_by UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'scheduled', 'live')),
  approved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create video schedule table
CREATE TABLE public.video_schedule (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL, -- in seconds
  is_live BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hot_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_schedule ENABLE ROW LEVEL SECURITY;

-- Create storage bucket for videos
INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', false);

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for hot_spots
CREATE POLICY "Everyone can view active hot spots" ON public.hot_spots FOR SELECT USING (is_active = true OR public.get_current_user_role() IN ('admin', 'relay'));
CREATE POLICY "Only admins can manage hot spots" ON public.hot_spots FOR ALL USING (public.get_current_user_role() = 'admin');

-- RLS Policies for videos
CREATE POLICY "Users can view approved videos" ON public.videos FOR SELECT USING (
  status = 'approved' OR 
  status = 'scheduled' OR 
  status = 'live' OR 
  public.get_current_user_role() IN ('admin', 'relay')
);
CREATE POLICY "Relay users can insert videos" ON public.videos FOR INSERT WITH CHECK (public.get_current_user_role() IN ('admin', 'relay'));
CREATE POLICY "Users can update own videos" ON public.videos FOR UPDATE USING (
  uploaded_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR 
  public.get_current_user_role() = 'admin'
);
CREATE POLICY "Admins can manage all videos" ON public.videos FOR ALL USING (public.get_current_user_role() = 'admin');

-- RLS Policies for video_schedule
CREATE POLICY "Users can view scheduled videos" ON public.video_schedule FOR SELECT USING (true);
CREATE POLICY "Only admins can manage schedule" ON public.video_schedule FOR ALL USING (public.get_current_user_role() = 'admin');

-- Storage policies for videos
CREATE POLICY "Authenticated users can view videos" ON storage.objects FOR SELECT USING (bucket_id = 'videos' AND auth.role() = 'authenticated');
CREATE POLICY "Relay users can upload videos" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'videos' AND 
  auth.role() = 'authenticated' AND
  public.get_current_user_role() IN ('admin', 'relay')
);
CREATE POLICY "Users can update own videos" ON storage.objects FOR UPDATE USING (
  bucket_id = 'videos' AND 
  auth.role() = 'authenticated' AND
  (auth.uid()::text = (storage.foldername(name))[1] OR public.get_current_user_role() = 'admin')
);
CREATE POLICY "Admins can delete videos" ON storage.objects FOR DELETE USING (
  bucket_id = 'videos' AND 
  auth.role() = 'authenticated' AND
  public.get_current_user_role() = 'admin'
);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'full_name',
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hot_spots_updated_at BEFORE UPDATE ON public.hot_spots FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON public.videos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default admin user (will be created when someone signs up with this email)
-- The admin account will be created through the auth system