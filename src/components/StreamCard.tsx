import { motion } from 'framer-motion';
import { Video, Users, Clock, Smartphone, Plane, Camera } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Stream } from '@/data/streams';

interface StreamCardProps {
  stream: Stream;
  onClick: () => void;
  index: number;
}

export default function StreamCard({ stream, onClick, index }: StreamCardProps) {
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
        'bouchon': 'bg-red-500 text-white',
        'fluide': 'bg-green-500 text-white', 
        'chargee': 'bg-orange-500 text-white',
        'charge': 'bg-orange-500 text-white'
      };
      const trafficLabels = {
        'bouchon': 'Bouchon',
        'fluide': 'Fluide',
        'chargee': 'Chargée',
        'charge': 'Chargée'
      };
      return {
        className: trafficColors[stream.trafficStatus as keyof typeof trafficColors],
        label: trafficLabels[stream.trafficStatus as keyof typeof trafficLabels],
        showDot: false
      };
    }
    
    return {
      className: stream.status === 'Live' ? 'bg-blue-500 text-white' : 'bg-muted text-muted-foreground',
      label: stream.status,
      showDot: stream.status === 'Live'
    };
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
        className="cursor-pointer transition-all duration-200 hover:shadow-card border-0 bg-gradient-card"
        onClick={onClick}
      >
        <CardContent className="p-0">
          <div className="flex">
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
                  <Camera className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              
            </div>

            {/* Contenu à droite */}
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-heading font-semibold text-foreground mb-1 text-sm">
                    {stream.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {stream.quartier}
                  </p>
                </div>
                
                {/* Badge de statut */}
                <Badge className={getBadgeDisplay().className} variant="secondary">
                  <div className="flex items-center gap-1">
                    {getBadgeDisplay().showDot && (
                      <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
                    )}
                    <span className="text-xs">{getBadgeDisplay().label}</span>
                  </div>
                </Badge>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-sm animate-pulse">{getTrafficMessage(stream.trafficStatus).emoji}</span>
                <span className="text-muted-foreground truncate">{getTrafficMessage(stream.trafficStatus).text}</span>
              </div>

              {stream.lastUpdate && (
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={10} />
                    <span>{stream.lastUpdate}</span>
                  </div>
                  
                  {stream.status === 'Live' && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-md">
                      <Video size={10} className="text-primary" />
                      <span className="text-xs text-primary font-medium">Voir</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}