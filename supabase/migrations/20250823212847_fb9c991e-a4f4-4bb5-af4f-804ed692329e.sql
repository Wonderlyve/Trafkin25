-- Create ads table for managing advertisements
CREATE TABLE public.ads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  content_text TEXT,
  is_active BOOLEAN DEFAULT true,
  ad_type TEXT NOT NULL DEFAULT 'banner', -- 'banner', 'stream_overlay', 'sidebar'
  position TEXT DEFAULT 'top', -- 'top', 'bottom', 'left', 'right', 'center'
  display_duration INTEGER DEFAULT 5, -- seconds for stream overlays
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Everyone can view active ads"
ON public.ads
FOR SELECT
USING (is_active = true OR get_current_user_role() = 'admin');

CREATE POLICY "Only admins can manage ads"
ON public.ads
FOR ALL
USING (get_current_user_role() = 'admin');

-- Trigger for timestamps
CREATE TRIGGER update_ads_updated_at
BEFORE UPDATE ON public.ads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();