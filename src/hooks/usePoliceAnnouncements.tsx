import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface PoliceAnnouncement {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  video_url?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const usePoliceAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<PoliceAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('police_announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data as PoliceAnnouncement[] || []);
    } catch (error: any) {
      console.error('Error fetching police announcements:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les annonces",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('ad-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('ad-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const uploadVideo = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('police-announcements')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('police-announcements')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const createAnnouncement = async (
    announcementData: Omit<PoliceAnnouncement, 'id' | 'created_at' | 'updated_at' | 'created_by'>, 
    imageFile?: File,
    videoFile?: File
  ) => {
    try {
      let imageUrl = announcementData.image_url;
      let videoUrl = announcementData.video_url;
      
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      if (videoFile) {
        videoUrl = await uploadVideo(videoFile);
      }

      const { data, error } = await supabase
        .from('police_announcements')
        .insert({ 
          ...announcementData, 
          image_url: imageUrl,
          video_url: videoUrl,
          created_by: user?.id 
        })
        .select()
        .single();

      if (error) throw error;
      
      setAnnouncements(prev => [data as PoliceAnnouncement, ...prev]);
      toast({
        title: "Succès",
        description: "Annonce créée avec succès",
      });
      return data;
    } catch (error: any) {
      console.error('Error creating police announcement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'annonce",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateAnnouncement = async (id: string, updates: Partial<PoliceAnnouncement>, imageFile?: File) => {
    try {
      let finalUpdates = { ...updates };
      
      if (imageFile) {
        const imageUrl = await uploadImage(imageFile);
        finalUpdates.image_url = imageUrl;
      }

      const { data, error } = await supabase
        .from('police_announcements')
        .update(finalUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setAnnouncements(prev => prev.map(announcement => 
        announcement.id === id ? data as PoliceAnnouncement : announcement
      ));
      toast({
        title: "Succès",
        description: "Annonce mise à jour",
      });
      return data;
    } catch (error: any) {
      console.error('Error updating police announcement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'annonce",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('police_announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setAnnouncements(prev => prev.filter(announcement => announcement.id !== id));
      toast({
        title: "Succès",
        description: "Annonce supprimée",
      });
    } catch (error: any) {
      console.error('Error deleting police announcement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'annonce",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getActiveAnnouncements = () => {
    return announcements.filter(announcement => announcement.is_active);
  };

  const getAnnouncementById = async (id: string): Promise<PoliceAnnouncement | null> => {
    try {
      const { data, error } = await supabase
        .from('police_announcements')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as PoliceAnnouncement;
    } catch (error: any) {
      console.error('Error fetching police announcement by id:', error);
      return null;
    }
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
    getAnnouncementById,
    refetch: fetchAnnouncements
  };
};