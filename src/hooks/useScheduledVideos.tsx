import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ScheduledVideo {
  id: string;
  video_id: string;
  scheduled_at: string;
  duration: number;
  is_live: boolean;
  created_at: string;
  actual_start_time?: string; // From streaming_timer table
  videos: {
    id: string;
    title: string;
    file_path: string;
    description: string | null;
    hot_spot_id: string | null;
  } | null;
}

interface HotSpotStats {
  id: string;
  viewers: number;
  lastUpdate: string;
  currentVideo: ScheduledVideo | null;
}

export function useScheduledVideos() {
  const [scheduledVideos, setScheduledVideos] = useState<ScheduledVideo[]>([]);
  const [hotSpotStats, setHotSpotStats] = useState<Record<string, HotSpotStats>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScheduledVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('video_schedule')
        .select(`
          *,
          videos (
            id,
            title,
            file_path,
            description,
            hot_spot_id
          ),
          streaming_timer (
            actual_start_time
          )
        `)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      
      // Process videos to include actual start time from streaming_timer
      const processedVideos = (data || []).map(video => ({
        ...video,
        actual_start_time: video.streaming_timer?.[0]?.actual_start_time
      }));
      
      setScheduledVideos(processedVideos);
      
      // Generate stats for each hot spot
      const stats: Record<string, HotSpotStats> = {};
      
      processedVideos.forEach(video => {
        if (video.videos?.hot_spot_id) {
          const hotSpotId = video.videos.hot_spot_id;
          const now = new Date();
          const scheduledTime = new Date(video.scheduled_at);
          const endTime = new Date(scheduledTime.getTime() + (video.duration * 1000));
          
          // Une vidéo est considérée comme active si elle est programmée et que is_live est true
          const isCurrentlyLive = video.is_live;
          const timeDiff = Math.abs(now.getTime() - scheduledTime.getTime());
          const minutesAgo = Math.floor(timeDiff / (1000 * 60));
          
          // Si la vidéo est en direct ou programmée pour ce hot spot, on la met comme vidéo courante
          const shouldShowVideo = isCurrentlyLive || (now >= scheduledTime && now <= endTime);
          
          stats[hotSpotId] = {
            id: hotSpotId,
            viewers: Math.floor(Math.random() * 500) + 50, // Simulate real viewers
            lastUpdate: isCurrentlyLive ? 'En direct' : shouldShowVideo ? 'Vidéo programmée' : `Il y a ${minutesAgo} min`,
            currentVideo: shouldShowVideo ? video : null
          };
        }
      });
      
      setHotSpotStats(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduledVideos();

    // Subscribe to real-time changes
    const channel1 = supabase
      .channel('video_schedule_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'video_schedule'
        },
        () => {
          fetchScheduledVideos();
        }
      )
      .subscribe();

    const channel2 = supabase
      .channel('videos_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'videos'
        },
        () => {
          fetchScheduledVideos();
        }
      )
      .subscribe();

    // Update stats every 15 seconds for better video switching precision
    const interval = setInterval(() => {
      fetchScheduledVideos();
    }, 15000);

    return () => {
      supabase.removeChannel(channel1);
      supabase.removeChannel(channel2);
      clearInterval(interval);
    };
  }, []);

  const getCurrentVideoForHotSpot = useCallback((hotSpotId: string): ScheduledVideo | null => {
    return hotSpotStats[hotSpotId]?.currentVideo || null;
  }, [hotSpotStats]);

  const getStatsForHotSpot = useCallback((hotSpotId: string): HotSpotStats | null => {
    return hotSpotStats[hotSpotId] || null;
  }, [hotSpotStats]);

  return {
    scheduledVideos,
    hotSpotStats,
    loading,
    error,
    refetch: fetchScheduledVideos,
    getCurrentVideoForHotSpot,
    getStatsForHotSpot
  };
}