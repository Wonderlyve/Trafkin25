import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye } from 'lucide-react';
import { PoliceAnnouncement } from '@/hooks/usePoliceAnnouncements';

interface PoliceAnnouncementCardProps {
  announcement: PoliceAnnouncement;
  onClick?: () => void;
  index?: number;
}

export default function PoliceAnnouncementCard({ 
  announcement, 
  onClick, 
  index = 0 
}: PoliceAnnouncementCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1,
        ease: [0.23, 1, 0.32, 1]
      }}
      whileHover={{ 
        y: -2,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
    >
    <Card 
      className="bg-blue-600/90 backdrop-blur border-blue-500/20 hover:bg-blue-600/95 transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
        <CardContent className="p-0">
          <div className="flex h-24">
            {/* Image à gauche */}
            <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-l-lg">
              {announcement.image_url ? (
                <img
                  src={announcement.image_url}
                  alt={announcement.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-white/10 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white/60" />
                </div>
              )}
            </div>

            {/* Contenu à droite */}
            <div className="flex-1 p-4 flex flex-col justify-between">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-sm leading-tight mb-1">
                    {announcement.title}
                  </h3>
                  <p className="text-white/80 text-xs line-clamp-1">
                    {announcement.description}
                  </p>
                </div>
                
                {/* Badge */}
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 ml-2 flex-shrink-0">
                  <Shield className="w-3 h-3 mr-1" />
                  <span className="text-xs">Police</span>
                </Badge>
              </div>

              <div className="flex items-center gap-1 text-xs text-yellow-400">
                <Eye className="w-3 h-3" />
                <span>Cliquez pour voir l'annonce</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}