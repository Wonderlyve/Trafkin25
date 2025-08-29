import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UpdateAnnouncement {
  id: string;
  title: string;
  description: string;
  update_link: string;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useUpdateAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<UpdateAnnouncement[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('update_announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching update announcements:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les annonces de mise à jour",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAnnouncement = async (announcementData: Omit<UpdateAnnouncement, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      const { data, error } = await supabase
        .from('update_announcements')
        .insert([announcementData])
        .select()
        .single();

      if (error) throw error;

      await fetchAnnouncements();
      toast({
        title: "Succès",
        description: "Annonce de mise à jour créée avec succès",
      });

      return data;
    } catch (error) {
      console.error('Error creating update announcement:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la création de l'annonce",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateAnnouncement = async (id: string, updates: Partial<UpdateAnnouncement>) => {
    try {
      const { data, error } = await supabase
        .from('update_announcements')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchAnnouncements();
      toast({
        title: "Succès",
        description: "Annonce mise à jour avec succès",
      });

      return data;
    } catch (error) {
      console.error('Error updating update announcement:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour de l'annonce",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('update_announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchAnnouncements();
      toast({
        title: "Succès",
        description: "Annonce supprimée avec succès",
      });
    } catch (error) {
      console.error('Error deleting update announcement:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression de l'annonce",
        variant: "destructive",
      });
    }
  };

  const getActiveAnnouncements = () => {
    return announcements.filter(announcement => announcement.is_active);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return {
    announcements,
    loading,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    getActiveAnnouncements,
    fetchAnnouncements,
  };
};