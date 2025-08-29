import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface PoliceReport {
  id: string;
  type: 'traffic' | 'incident' | 'suspicious';
  title: string;
  description?: string;
  location: string;
  latitude?: number;
  longitude?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'assigned' | 'resolved';
  reported_by?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface PoliceAlert {
  id: string;
  type: 'traffic_jam' | 'accident' | 'suspicious_activity';
  message: string;
  location: string;
  latitude?: number;
  longitude?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  is_active: boolean;
  created_by?: string;
  created_at: string;
  expires_at?: string;
}

export interface PoliceIntervention {
  id: string;
  report_id?: string;
  officer_id: string;
  status: 'dispatched' | 'en_route' | 'on_scene' | 'completed';
  notes?: string;
  started_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export const usePoliceReports = () => {
  return useQuery({
    queryKey: ['police-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('police_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PoliceReport[];
    },
  });
};

export const usePoliceAlerts = () => {
  return useQuery({
    queryKey: ['police-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('police_alerts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PoliceAlert[];
    },
  });
};

export const usePoliceInterventions = () => {
  return useQuery({
    queryKey: ['police-interventions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('police_interventions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PoliceIntervention[];
    },
  });
};

export const useCreatePoliceReport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (reportData: Omit<PoliceReport, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('police_reports')
        .insert([reportData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['police-reports'] });
      toast({
        title: "Signalement créé",
        description: "Le signalement a été créé avec succès"
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le signalement",
        variant: "destructive"
      });
    }
  });
};

export const useCreatePoliceAlert = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (alertData: Omit<PoliceAlert, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('police_alerts')
        .insert([alertData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['police-alerts'] });
      toast({
        title: "Alerte créée",
        description: "L'alerte a été diffusée avec succès"
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'alerte",
        variant: "destructive"
      });
    }
  });
};

export const useCreateIntervention = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (interventionData: Omit<PoliceIntervention, 'id' | 'created_at' | 'updated_at' | 'started_at'>) => {
      const { data, error } = await supabase
        .from('police_interventions')
        .insert([{
          ...interventionData,
          started_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['police-interventions'] });
      toast({
        title: "Intervention lancée",
        description: "L'équipe a été notifiée"
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de lancer l'intervention",
        variant: "destructive"
      });
    }
  });
};