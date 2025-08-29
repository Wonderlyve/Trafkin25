import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useAdminNotifications = () => {
  const [pendingVideosCount, setPendingVideosCount] = useState(0);
  const { isAdmin, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      setPendingVideosCount(0);
      return;
    }

    const fetchPendingVideos = async () => {
      try {
        const { count, error } = await supabase
          .from('videos')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        if (error) throw error;
        setPendingVideosCount(count || 0);
      } catch (error) {
        console.error('Error fetching pending videos count:', error);
        setPendingVideosCount(0);
      }
    };

    // Fetch initial count
    fetchPendingVideos();

    // Set up real-time subscription for videos table
    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'videos'
        },
        (payload) => {
          // Refetch count when videos table changes
          fetchPendingVideos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, isAdmin]);

  return {
    pendingVideosCount
  };
};