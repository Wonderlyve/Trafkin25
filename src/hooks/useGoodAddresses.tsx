import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface GoodAddress {
  id: string;
  name: string;
  category: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  distance?: string;
  rating: number;
  price_range?: string;
  features?: string[];
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export function useGoodAddresses() {
  const [addresses, setAddresses] = useState<GoodAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('good_addresses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error('Error fetching good addresses:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les bonnes adresses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAddress = async (address: Omit<GoodAddress, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }

      // Get user profile to set created_by
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const addressData = {
        ...address,
        created_by: profile?.id || null
      };

      const { data, error } = await supabase
        .from('good_addresses')
        .insert([addressData])
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      
      await fetchAddresses();
      toast({
        title: "Succès",
        description: "Bonne adresse créée avec succès",
      });
      
      return data;
    } catch (error) {
      console.error('Error creating address:', error);
      
      // Provide more specific error messages
      let errorMessage = "Impossible de créer la bonne adresse";
      if (error instanceof Error) {
        if (error.message.includes('RLS')) {
          errorMessage = "Permissions insuffisantes. Seuls les administrateurs peuvent créer des adresses.";
        } else if (error.message.includes('authentifié')) {
          errorMessage = error.message;
        } else if (error.message.includes('violates')) {
          errorMessage = "Données invalides. Vérifiez que tous les champs requis sont remplis.";
        }
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateAddress = async (id: string, updates: Partial<GoodAddress>) => {
    try {
      const { error } = await supabase
        .from('good_addresses')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      await fetchAddresses();
      toast({
        title: "Succès",
        description: "Bonne adresse mise à jour avec succès",
      });
    } catch (error) {
      console.error('Error updating address:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la bonne adresse",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      const { error } = await supabase
        .from('good_addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchAddresses();
      toast({
        title: "Succès",
        description: "Bonne adresse supprimée avec succès",
      });
    } catch (error) {
      console.error('Error deleting address:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la bonne adresse",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  return {
    addresses,
    loading,
    createAddress,
    updateAddress,
    deleteAddress,
    refetch: fetchAddresses
  };
}