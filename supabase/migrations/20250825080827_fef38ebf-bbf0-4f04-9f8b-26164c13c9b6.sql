-- Créer les tables pour le système de police

-- Table pour les signalements
CREATE TABLE public.police_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL, -- 'traffic', 'incident', 'suspicious'
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'assigned', 'resolved'
  reported_by UUID REFERENCES public.profiles(id),
  assigned_to UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Table pour les alertes
CREATE TABLE public.police_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL, -- 'traffic_jam', 'accident', 'suspicious_activity'
  message TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Table pour les interventions
CREATE TABLE public.police_interventions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES public.police_reports(id),
  officer_id UUID REFERENCES public.profiles(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'dispatched', -- 'dispatched', 'en_route', 'on_scene', 'completed'
  notes TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.police_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.police_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.police_interventions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour police_reports
CREATE POLICY "Everyone can view reports" 
ON public.police_reports 
FOR SELECT 
USING (true);

CREATE POLICY "Police can manage reports" 
ON public.police_reports 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'police'::text]));

CREATE POLICY "Users can create reports" 
ON public.police_reports 
FOR INSERT 
WITH CHECK (true);

-- Politiques RLS pour police_alerts
CREATE POLICY "Everyone can view active alerts" 
ON public.police_alerts 
FOR SELECT 
USING (is_active = true OR get_current_user_role() = ANY (ARRAY['admin'::text, 'police'::text]));

CREATE POLICY "Police can manage alerts" 
ON public.police_alerts 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'police'::text]));

-- Politiques RLS pour police_interventions
CREATE POLICY "Police can view interventions" 
ON public.police_interventions 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'police'::text]));

CREATE POLICY "Police can manage interventions" 
ON public.police_interventions 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'police'::text]));

-- Créer des triggers pour updated_at
CREATE TRIGGER update_police_reports_updated_at
BEFORE UPDATE ON public.police_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_police_interventions_updated_at
BEFORE UPDATE ON public.police_interventions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Activer realtime pour toutes les tables
ALTER TABLE public.police_reports REPLICA IDENTITY FULL;
ALTER TABLE public.police_alerts REPLICA IDENTITY FULL;
ALTER TABLE public.police_interventions REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.police_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.police_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.police_interventions;