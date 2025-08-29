import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Stream } from '@/data/streams';
import { useScheduledVideos } from './useScheduledVideos';

interface HotSpot {
  id: string;
  name: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  image_url: string | null;
  is_active: boolean;
  traffic_status: 'bouchon' | 'fluide' | 'chargee' | 'charge' | null;
  created_at: string;
  updated_at?: string;
}

export function useHotSpots() {
  const [hotSpots, setHotSpots] = useState<HotSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getStatsForHotSpot, loading: videosLoading } = useScheduledVideos();

  const fetchHotSpots = async () => {
    try {
      const { data, error } = await supabase
        .from('hot_spots')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHotSpots((data || []) as HotSpot[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotSpots();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('hot_spots_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hot_spots'
        },
        () => {
          fetchHotSpots();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Convert hot spots to Stream format for compatibility with real-time data
  const streams: Stream[] = useMemo(() => {
    return hotSpots.map((hotSpot, index) => {
      const stats = getStatsForHotSpot(hotSpot.id);
      // Un hot spot est considéré comme "Live" s'il est actif
      // Il reste Live tant qu'il est actif, peu importe s'il y a une vidéo programmée ou non
      const isLive = hotSpot.is_active ? 'Live' : 'Offline';
      
      return {
        id: hotSpot.id, // Keep UUID as string for proper navigation
        name: hotSpot.name,
        type: 'Caméra',
        status: isLive,
        url: `https://example.com/${hotSpot.name.toLowerCase().replace(/\s+/g, '-')}.m3u8`,
        location: {
          lat: hotSpot.latitude || -4.3196,
          lng: hotSpot.longitude || 15.3075
        },
        quartier: hotSpot.address || hotSpot.name,
        description: hotSpot.description || `Point de surveillance ${hotSpot.name}`,
        viewers: stats?.viewers || 0,
        lastUpdate: stats?.lastUpdate || 'Aucune donnée',
        hotSpotId: hotSpot.id, // Add original hot spot ID for video lookup
        imageUrl: hotSpot.image_url, // Add image URL for display
        trafficStatus: hotSpot.traffic_status // Add traffic status for badge display
      };
    });
  }, [hotSpots, getStatsForHotSpot]);

  return {
    hotSpots,
    streams,
    loading: loading || videosLoading,
    error,
    refetch: fetchHotSpots
  };
}