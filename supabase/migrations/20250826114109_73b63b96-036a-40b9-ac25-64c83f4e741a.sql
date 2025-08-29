-- Create app settings table to store default stream placeholder image and other settings
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for app settings
CREATE POLICY "Everyone can view app settings" 
ON public.app_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage app settings" 
ON public.app_settings 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Insert default stream placeholder image setting
INSERT INTO public.app_settings (setting_key, setting_value, description) 
VALUES ('default_stream_placeholder', '/default-stream-placeholder.png', 'Image par défaut affichée quand aucune vidéo n''est disponible pour un hot spot')
ON CONFLICT (setting_key) DO NOTHING;

-- Create trigger for automatic timestamp updates on app_settings
CREATE TRIGGER update_app_settings_updated_at
BEFORE UPDATE ON public.app_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();