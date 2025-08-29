import { useState, useEffect } from 'react';

export function useTimeAgo(publishedAt: string | Date) {
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    const calculateTimeAgo = () => {
      const now = new Date();
      const published = new Date(publishedAt);
      const diffInSeconds = Math.floor((now.getTime() - published.getTime()) / 1000);

      if (diffInSeconds < 60) {
        return `${diffInSeconds} seconde${diffInSeconds > 1 ? 's' : ''}`;
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''}`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} heure${hours > 1 ? 's' : ''}`;
      } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} jour${days > 1 ? 's' : ''}`;
      } else if (diffInSeconds < 2629746) {
        const weeks = Math.floor(diffInSeconds / 604800);
        return `${weeks} semaine${weeks > 1 ? 's' : ''}`;
      } else if (diffInSeconds < 31556952) {
        const months = Math.floor(diffInSeconds / 2629746);
        return `${months} mois`;
      } else {
        const years = Math.floor(diffInSeconds / 31556952);
        return `${years} an${years > 1 ? 's' : ''}`;
      }
    };

    // Calculer immédiatement
    setTimeAgo(calculateTimeAgo());

    // Mettre à jour toutes les minutes
    const interval = setInterval(() => {
      setTimeAgo(calculateTimeAgo());
    }, 60000);

    return () => clearInterval(interval);
  }, [publishedAt]);

  return timeAgo;
}