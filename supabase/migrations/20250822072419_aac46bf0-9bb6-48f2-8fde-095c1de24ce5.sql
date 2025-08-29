-- Create good_addresses table for managing good places/addresses
CREATE TABLE public.good_addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  distance TEXT,
  rating NUMERIC DEFAULT 0,
  price_range TEXT,
  features TEXT[],
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Enable Row Level Security
ALTER TABLE public.good_addresses ENABLE ROW LEVEL SECURITY;

-- Create policies for good_addresses
CREATE POLICY "Everyone can view active good addresses" 
ON public.good_addresses 
FOR SELECT 
USING (is_active = true OR get_current_user_role() = 'admin');

CREATE POLICY "Only admins can manage good addresses" 
ON public.good_addresses 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_good_addresses_updated_at
BEFORE UPDATE ON public.good_addresses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();