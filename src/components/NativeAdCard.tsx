import { motion } from 'framer-motion';
import { ExternalLink, Camera } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Ad } from '@/hooks/useAds';

interface NativeAdCardProps {
  ad: Ad;
  index: number;
}

export default function NativeAdCard({ ad, index }: NativeAdCardProps) {
  const handleClick = () => {
    if (ad.content_text && ad.content_text.startsWith('http')) {
      window.open(ad.content_text, '_blank');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className="cursor-pointer transition-all duration-200 hover:shadow-card border-0 bg-gradient-card relative overflow-hidden"
        onClick={handleClick}
      >
        {/* Badge Sponsorisé en overlay */}
        <div className="absolute top-2 right-2 z-10">
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-medium">
            Sponsorisé
          </Badge>
        </div>

        <CardContent className="p-0">
          <div className="flex">
            {/* Image d'aperçu à gauche */}
            <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-l-lg">
              {ad.image_url ? (
                <img 
                  src={ad.image_url} 
                  alt={ad.title}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  <Camera className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Contenu à droite */}
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 pr-2">
                  <h3 className="font-heading font-semibold text-foreground mb-1 text-sm">
                    {ad.title}
                  </h3>
                  {ad.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {ad.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-sm">📢</span>
                  <span className="text-muted-foreground truncate">Contenu sponsorisé</span>
                </div>

                {ad.content_text && ad.content_text.startsWith('http') && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-auto p-1 text-primary hover:text-primary-foreground hover:bg-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClick();
                    }}
                  >
                    <ExternalLink size={14} />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}