import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import StreamCard from '@/components/StreamCard';
import PoliceAnnouncementCard from '@/components/PoliceAnnouncementCard';
import SideMenu from '@/components/SideMenu';
import { Stream } from '@/data/streams';
import { useHotSpots } from '@/hooks/useHotSpots';
import { usePoliceAnnouncements } from '@/hooks/usePoliceAnnouncements';
import { useUpdateAnnouncements } from '@/hooks/useUpdateAnnouncements';
import { UpdateAnnouncementCard } from '@/components/UpdateAnnouncementCard';
import { useToast } from '@/hooks/use-toast';
import { useAds, type Ad } from '@/hooks/useAds';
import NativeAdCard from '@/components/NativeAdCard';

export default function Index() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStreams, setFilteredStreams] = useState<Stream[]>([]);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const { streams, loading, error } = useHotSpots();
  const { getActiveAnnouncements, loading: announcementsLoading } = usePoliceAnnouncements();
  const { getActiveAnnouncements: getActiveUpdateAnnouncements } = useUpdateAnnouncements();
  const { getActiveAds } = useAds();
  const { toast } = useToast();

  const activeAnnouncements = getActiveAnnouncements();
  const activeUpdateAnnouncements = getActiveUpdateAnnouncements();

  useEffect(() => {
    if (streams.length > 0) {
      const filtered = streams.filter(stream =>
        stream.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stream.quartier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stream.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStreams(filtered);
    }
  }, [searchQuery, streams]);

  const handleStreamClick = (streamId: string | number) => {
    console.log('Navigating to stream:', streamId);
    const stream = streams.find(s => s.id === streamId);
    if (!stream) {
      toast({
        title: "Erreur d'accès",
        description: "Ce coin chaud n'est pas disponible actuellement. Il pourrait être hors ligne ou en maintenance.",
        variant: "destructive"
      });
      return;
    }
    navigate(`/stream/${streamId}`);
  };

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

      {/* Hot Spots Header - Appears right after main header */}
      <motion.div 
        className="px-4 pt-[160px] pb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-heading font-semibold text-foreground">
            Coins Chauds {filteredStreams.length > 0 && `(${filteredStreams.length})`}
          </h2>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-sm text-success font-medium">
              {streams.filter(s => s.status === 'Live').length} en direct
            </span>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="px-4 py-2">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {/* Update Announcements */}
          {activeUpdateAnnouncements.length > 0 && (
            <div className="mb-6">
              <div className="space-y-3">
                {activeUpdateAnnouncements.map((announcement) => (
                  <UpdateAnnouncementCard
                    key={announcement.id}
                    announcement={announcement}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Police Announcements Section */}
          {!announcementsLoading && activeAnnouncements.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-heading font-semibold text-foreground">
                  Annonces Police
                </h2>
              </div>
              <div className="space-y-3">
                {activeAnnouncements.map((announcement, index) => (
                  <PoliceAnnouncementCard
                    key={announcement.id}
                    announcement={announcement}
                    onClick={() => {
                      navigate(`/police-announcement/${announcement.id}`);
                    }}
                    index={index}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Hot Spots Content with Native Ads */}
          <div className="space-y-3">
            {loading ? (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">Chargement des coins chauds...</p>
              </motion.div>
            ) : error ? (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-destructive">Erreur: {error}</p>
              </motion.div>
            ) : (() => {
              // Obtenir les publicités natives actives
              const nativeAds = getActiveAds('native_card');
              
              // Créer un array avec l'ordre voulu: streams avec pubs natives intégrées
              const allItems: Array<{ type: 'stream' | 'ad', data: Stream | Ad, originalIndex: number }> = [];
              
              // Ajouter les streams
              filteredStreams.forEach((stream, index) => {
                allItems.push({ type: 'stream', data: stream, originalIndex: index });
              });
              
              // Insérer les publicités natives aux positions 1 et 3 (parmi les 5 premières)
              if (nativeAds.length > 0 && filteredStreams.length > 0) {
                const insertPositions = [1, 3];
                nativeAds.slice(0, 2).forEach((ad, adIndex) => {
                  const position = insertPositions[adIndex];
                  if (position <= allItems.length) {
                    allItems.splice(position + adIndex, 0, { 
                      type: 'ad', 
                      data: ad, 
                      originalIndex: -1 
                    });
                  }
                });
              }
              
              return allItems.length > 0 ? (
                allItems.map((item, index) => {
                  if (item.type === 'ad') {
                    return (
                      <NativeAdCard
                        key={`ad-${item.data.id}`}
                        ad={item.data as Ad}
                        index={index + activeAnnouncements.length}
                      />
                    );
                  } else {
                    return (
                      <StreamCard
                        key={item.data.id}
                        stream={item.data as Stream}
                        onClick={() => handleStreamClick((item.data as Stream).id)}
                        index={index + activeAnnouncements.length}
                      />
                    );
                  }
                })
              ) : (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-muted-foreground">
                    {searchQuery ? `Aucun coin chaud trouvé pour "${searchQuery}"` : 'Aucun coin chaud disponible'}
                  </p>
                </motion.div>
              );
            })()}
          </div>

          {/* Banner Ads Section */}
          {(() => {
            const bannerAds = getActiveAds('banner');
            const displayAd = bannerAds.length > 0 ? bannerAds[0] : null;
            
            return displayAd ? (
              <motion.div 
                className="mt-6 mb-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <div 
                  className="relative bg-gradient-to-r from-accent/10 to-secondary/10 rounded-xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-300"
                  onClick={() => {
                    if (displayAd.content_text && displayAd.content_text.startsWith('http')) {
                      window.open(displayAd.content_text, '_blank');
                    }
                  }}
                >
                  {displayAd.image_url && (
                    <div className="relative h-32 overflow-hidden">
                      <img 
                        src={displayAd.image_url}
                        alt={displayAd.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-2">{displayAd.title}</h3>
                    {displayAd.description && (
                      <p className="text-sm text-muted-foreground">{displayAd.description}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : null;
          })()}
        </motion.div>
      </div>

      {/* Side Menu */}
      <SideMenu isOpen={isSideMenuOpen} onClose={() => setIsSideMenuOpen(false)} />
    </div>
  );
}