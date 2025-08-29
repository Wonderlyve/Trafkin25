import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import StreamCard from '@/components/StreamCard';
import DesktopStreamCard from '@/components/DesktopStreamCard';
import TrafficAlertsPanel from '@/components/TrafficAlertsPanel';
import SideMenu from '@/components/SideMenu';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/hooks/useAuth';
import { useScreenSize } from '@/hooks/useScreenSize';
import { STREAMS, Stream } from '@/data/streams';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isDesktop } = useScreenSize();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStreams, setFilteredStreams] = useState<Stream[]>(STREAMS);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const filtered = STREAMS.filter(stream =>
      stream.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stream.quartier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stream.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredStreams(filtered);
  }, [searchQuery]);

  const handleStreamClick = (streamId: string | number) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    navigate(`/stream/${streamId}`);
  };

  // Desktop layout
  if (isDesktop) {
    return (
      <div className="min-h-screen bg-background p-6">
        {/* Search Header */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Rechercher par quartier ou type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </motion.div>

        {/* Coins Chauds Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-heading font-bold text-foreground">
              Coin Chaud {filteredStreams.length > 0 && `(${filteredStreams.length})`}
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-sm text-success font-medium">
                {STREAMS.filter(s => s.status === 'Live').length} en direct
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {filteredStreams.length > 0 ? (
              filteredStreams.map((stream, index) => (
                <DesktopStreamCard
                  key={stream.id}
                  stream={stream}
                  onClick={() => handleStreamClick(stream.id)}
                  index={index}
                />
              ))
            ) : (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-muted-foreground">
                  Aucun flux trouvé pour "{searchQuery}"
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Auth Modal */}
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          message="Vous devez vous connecter pour voir le contenu des coins chauds."
        />
      </div>
    );
  }

  // Mobile layout
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-primary text-primary-foreground px-4 py-6 pb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <motion.h1 
            className="text-2xl font-heading font-bold"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            TrafKin
          </motion.h1>
          
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <Button variant="outline" size="icon" className="bg-primary-foreground text-primary border-2 border-primary-foreground hover:bg-primary-foreground/90">
                <Filter size={18} />
              </Button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <Button 
                variant="outline" 
                size="icon" 
                className="bg-primary-foreground text-primary border-2 border-primary-foreground hover:bg-primary-foreground/90"
                onClick={() => setIsSideMenuOpen(true)}
              >
                <Menu size={18} />
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Search Bar */}
        <motion.div 
          className="relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Rechercher par quartier ou type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 focus:bg-primary-foreground/15"
          />
        </motion.div>
      </motion.header>

      {/* Streams List */}
      <div className="px-4 py-6 pt-[140px]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading font-semibold text-foreground">
              Coins Chauds {filteredStreams.length > 0 && `(${filteredStreams.length})`}
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-sm text-success font-medium">
                {STREAMS.filter(s => s.status === 'Live').length} en direct
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {filteredStreams.length > 0 ? (
              filteredStreams.map((stream, index) => (
                <StreamCard
                  key={stream.id}
                  stream={stream}
                  onClick={() => handleStreamClick(stream.id)}
                  index={index}
                />
              ))
            ) : (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-muted-foreground">
                  Aucun flux trouvé pour "{searchQuery}"
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Side Menu */}
      <SideMenu isOpen={isSideMenuOpen} onClose={() => setIsSideMenuOpen(false)} />
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message="Vous devez vous connecter pour voir le contenu des coins chauds."
      />
    </div>
  );
}