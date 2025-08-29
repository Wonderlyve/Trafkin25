import { motion } from 'framer-motion';
import { Navigation, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useHotSpots } from '@/hooks/useHotSpots';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from '@/components/AuthModal';
import { useState } from 'react';
import MapComponent from '@/components/MapComponent';

export default function Map() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { streams } = useHotSpots();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleStreamClick = (streamId: string | number) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    navigate(`/stream/${streamId}`);
  };

  return (
    <motion.div 
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <motion.header 
        className="bg-gradient-primary text-primary-foreground px-4 py-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold">Carte du Trafic</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
              <Navigation size={18} />
            </Button>
            <Button variant="outline" size="icon" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
              <Layers size={18} />
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Real Map Container */}
      <motion.div 
        className="relative h-[600px] m-4 rounded-2xl overflow-hidden shadow-card"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <MapComponent streams={streams} onStreamClick={handleStreamClick} />
      </motion.div>

      {/* Stream Legend */}
      <motion.div 
        className="px-4 py-2"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gradient-card border-0 shadow-card">
          <CardContent className="p-4">
            <h3 className="font-heading font-semibold mb-3">Légende</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-success rounded-full border-2 border-white shadow-sm" />
                <span className="text-sm">Flux en direct</span>
                <Badge className="bg-success text-success-foreground text-xs">
                  {streams.filter(s => s.status === 'Live').length}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-muted rounded-full border-2 border-white shadow-sm" />
                <span className="text-sm">Flux hors ligne</span>
                <Badge variant="outline" className="text-xs">
                  {streams.filter(s => s.status === 'Offline').length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <motion.div 
        className="px-4 py-2"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{streams.length}</p>
              <p className="text-sm text-muted-foreground">Points de contrôle</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-success">{streams.filter(s => s.status === 'Live').length}</p>
              <p className="text-sm text-muted-foreground">En direct</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message="Vous devez vous connecter pour voir le contenu des coins chauds."
      />
    </motion.div>
  );
}