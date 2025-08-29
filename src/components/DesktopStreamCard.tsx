import { motion } from 'framer-motion';
import { Camera, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Stream } from '@/data/streams';

interface DesktopStreamCardProps {
  stream: Stream;
  onClick: () => void;
  index: number;
}

export default function DesktopStreamCard({ stream, onClick, index }: DesktopStreamCardProps) {
  const getTrafficMessage = (trafficStatus: Stream['trafficStatus']) => {
    switch (trafficStatus) {
      case 'fluide':
        return { text: "Prenez cet itinéraire – c'est fluide !", emoji: "🟢" };
      case 'chargee':
      case 'charge':
        return { text: "Trafic dense – mais ça roule.", emoji: "🟠" };
      case 'bouchon':
        return { text: "Évitez cet itinéraire – gros bouchon.", emoji: "🔴" };
      default:
        return { text: "Pas d'information", emoji: "⚪" };
    }
  };

  const getBadgeDisplay = () => {
    if (stream.trafficStatus && stream.status === 'Live') {
      const trafficColors = {
        'bouchon': 'bg-destructive text-destructive-foreground',
        'fluide': 'bg-success text-success-foreground', 
        'chargee': 'bg-warning text-warning-foreground',
        'charge': 'bg-warning text-warning-foreground'
      };
      const trafficLabels = {
        'bouchon': 'Bouchon',
        'fluide': 'Fluide',
        'chargee': 'Chargé',
        'charge': 'Chargé'
      };
      return {
        className: trafficColors[stream.trafficStatus as keyof typeof trafficColors],
        label: trafficLabels[stream.trafficStatus as keyof typeof trafficLabels],
        showDot: false
      };
    }
    
    return {
      className: stream.status === 'Live' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
      label: stream.status,
      showDot: stream.status === 'Live'
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <Card className="cursor-pointer transition-all duration-200 hover:shadow-card border border-border bg-card">
        <CardContent className="p-0">
          <div className="flex items-center">
            {/* Image d'aperçu à gauche */}
            <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-l-lg">
              {stream.imageUrl ? (
                <img 
                  src={stream.imageUrl} 
                  alt={stream.name}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  <Camera className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Contenu au centre */}
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-heading font-semibold text-foreground mb-1 text-base">
                    {stream.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {stream.quartier}
                  </p>
                </div>
                
                {/* Badge de statut */}
                <Badge className={getBadgeDisplay().className} variant="secondary">
                  <div className="flex items-center gap-1">
                    {getBadgeDisplay().showDot && (
                      <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
                    )}
                    <span className="text-sm font-medium">{getBadgeDisplay().label}</span>
                  </div>
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-base">{getTrafficMessage(stream.trafficStatus).emoji}</span>
                  <span className="text-muted-foreground">{getTrafficMessage(stream.trafficStatus).text}</span>
                </div>

                {stream.lastUpdate && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={12} />
                    <span>{stream.lastUpdate}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bouton à droite */}
            <div className="p-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
                className="whitespace-nowrap"
              >
                Voir le direct
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}