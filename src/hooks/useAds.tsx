import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface Ad {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  content_text?: string;
  is_active: boolean;
  ad_type: 'banner' | 'stream_overlay' | 'sidebar' | 'native_card';
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  display_duration: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const useAds = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchAds = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAds(data as Ad[] || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les publicités",
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

  const createAd = async (adData: Omit<Ad, 'id' | 'created_at' | 'updated_at' | 'created_by'>, imageFile?: File) => {
    try {
      let imageUrl = adData.image_url;
      
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const { data, error } = await supabase
        .from('ads')
        .insert({ ...adData, image_url: imageUrl, created_by: user?.id })
        .select()
        .single();

      if (error) throw error;
      
      setAds(prev => [data as Ad, ...prev]);
      toast({
        title: "Succès",
        description: "Publicité créée avec succès",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la publicité",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateAd = async (id: string, updates: Partial<Ad>, imageFile?: File) => {
    try {
      let finalUpdates = { ...updates };
      
      if (imageFile) {
        const imageUrl = await uploadImage(imageFile);
        finalUpdates.image_url = imageUrl;
      }

      const { data, error } = await supabase
        .from('ads')
        .update(finalUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setAds(prev => prev.map(ad => ad.id === id ? data as Ad : ad));
      toast({
        title: "Succès",
        description: "Publicité mise à jour",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour la publicité",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteAd = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setAds(prev => prev.filter(ad => ad.id !== id));
      toast({
        title: "Succès",
        description: "Publicité supprimée",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la publicité",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getActiveAds = (type?: string) => {
    return ads.filter(ad => ad.is_active && (!type || ad.ad_type === type));
  };

  useEffect(() => {
    fetchAds();
  }, []);

  return {
    ads,
    loading,
    createAd,
    updateAd,
    deleteAd,
    getActiveAds,
    refetch: fetchAds
  };
};