import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Heart, AlertTriangle, Users, Video, Maximize2, Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getStreamById } from '@/data/streams';
import { useToast } from '@/hooks/use-toast';
import { useHotSpots } from '@/hooks/useHotSpots';
import { useScheduledVideos } from '@/hooks/useScheduledVideos';
import { useAuth } from '@/hooks/useAuth';
import { useAds, type Ad } from '@/hooks/useAds';
import { useAppSettings } from '@/hooks/useAppSettings';
import AuthModal from '@/components/AuthModal';
import insuranceAd from '@/assets/insurance-ad.jpg';

export default function StreamPlayer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [previousVideoId, setPreviousVideoId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAd, setShowAd] = useState(false);
  const [currentAd, setCurrentAd] = useState<Ad | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { streams, loading } = useHotSpots();
  const { getCurrentVideoForHotSpot } = useScheduledVideos();
  const { getActiveAds } = useAds();
  const { getSetting } = useAppSettings();
  
  const stream = streams.find(s => s.id === id);
  const currentVideo = stream?.hotSpotId ? getCurrentVideoForHotSpot(stream.hotSpotId) : null;

  // Gestion des publicités overlay
  useEffect(() => {
    const overlayAds = getActiveAds('stream_overlay');
    if (overlayAds.length > 0) {
      const showAdTimeout = setTimeout(() => {
        const randomAd = overlayAds[Math.floor(Math.random() * overlayAds.length)];
        setCurrentAd(randomAd);
        setShowAd(true);
        
        // Cacher l'overlay après la durée définie
        setTimeout(() => {
          setShowAd(false);
        }, randomAd.display_duration * 1000);
      }, 3000); // Attendre 3s avant d'afficher la première pub

      return () => clearTimeout(showAdTimeout);
    }
  }, [getActiveAds]);

  useEffect(() => {
    // Show auth modal if not authenticated
    if (!authLoading && !isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (!id) {
      navigate('/');
      return;
    }
    
    // Only show error if loading is complete and stream is still not found
    if (!loading && !stream && isAuthenticated) {
      toast({
        title: "Coin chaud introuvable",
        description: "Ce coin chaud n'existe pas ou a été supprimé. Redirection vers l'accueil.",
        variant: "destructive"
      });
      navigate('/');
      return;
    }
  }, [stream, navigate, id, toast, loading, isAuthenticated, authLoading]);

  // Automatic video switching effect
  useEffect(() => {
    const currentVideoId = currentVideo?.id;
    
    // If video has changed and there's a new video, auto-play it
    if (currentVideoId && currentVideoId !== previousVideoId && videoRef.current) {
      console.log('Changement de vidéo détecté:', previousVideoId, '->', currentVideoId);
      
      // Small delay to ensure video element is loaded
      const timer = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.load(); // Reload the video element
          videoRef.current.play().then(() => {
            console.log('Nouvelle vidéo lancée automatiquement');
            toast({
              title: "Nouvelle vidéo",
              description: `${currentVideo.videos?.title || 'Vidéo suivante'} est maintenant en cours`,
            });
          }).catch((error) => {
            console.error('Erreur lors du lancement automatique:', error);
          });
        }
      }, 500);
      
      setPreviousVideoId(currentVideoId);
      
      return () => clearTimeout(timer);
    } else if (currentVideoId && !previousVideoId) {
      // First video load
      setPreviousVideoId(currentVideoId);
    }
  }, [currentVideo, previousVideoId, toast]);

  // Real-time clock update effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Function to format elapsed time precisely from actual start time
  const formatElapsedTime = (actualStartTime: string): string => {
    const startTime = new Date(actualStartTime);
    const diffMs = currentTime.getTime() - startTime.getTime();
    
    if (diffMs < 0) {
      return 'EN ATTENTE';
    }
    
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      const remainingHours = diffHours % 24;
      return remainingHours > 0 ? `${diffDays}J ${remainingHours}H` : `${diffDays}J`;
    } else if (diffHours > 0) {
      const remainingMinutes = diffMinutes % 60;
      return remainingMinutes > 0 ? `${diffHours}H ${remainingMinutes}MIN` : `${diffHours}H`;
    } else if (diffMinutes > 0) {
      const remainingSeconds = diffSeconds % 60;
      return remainingSeconds > 0 ? `${diffMinutes}MIN ${remainingSeconds}S` : `${diffMinutes}MIN`;
    } else {
      return diffSeconds > 0 ? `${diffSeconds}S` : 'À L\'INSTANT';
    }
  };

  // Show loading while auth or streams are being fetched
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">
            {authLoading ? "Vérification de l'authentification..." : "Chargement du coin chaud..."}
          </p>
        </div>
      </div>
    );
  }

  if (!stream) {
    return null;
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    toast({
      title: "Flux actualisé",
      description: "Le flux vidéo a été rechargé avec succès.",
    });
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Retiré des favoris" : "Ajouté aux favoris",
      description: `${stream.name} ${isFavorite ? 'retiré de' : 'ajouté à'} vos favoris.`,
    });
  };

  const handleReport = () => {
    toast({
      title: "Signalement envoyé",
      description: "Votre rapport de trafic a été transmis aux autorités compétentes.",
    });
  };

  return (
    <motion.div 
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <motion.header 
        className="bg-gradient-primary text-primary-foreground px-4 py-4 sm:py-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="text-primary-foreground hover:bg-primary-foreground/10 shrink-0"
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-heading font-semibold text-lg sm:text-xl truncate">{stream.name}</h1>
            <p className="text-sm text-primary-foreground/80 truncate">{stream.quartier}</p>
          </div>
          <Badge variant="secondary" className="shrink-0">
            <span className="hidden sm:inline">
              {stream.status === 'Live' && currentVideo?.actual_start_time 
                ? `en ligne il y a ${formatElapsedTime(currentVideo.actual_start_time)}`
                : stream.status === 'Live' && currentVideo?.scheduled_at
                ? `en ligne il y a ${formatElapsedTime(currentVideo.scheduled_at)}`
                : stream.status
              }
            </span>
            <span className="sm:hidden">
              {stream.status === 'Live' && currentVideo?.actual_start_time 
                ? formatElapsedTime(currentVideo.actual_start_time)
                : stream.status === 'Live' && currentVideo?.scheduled_at
                ? formatElapsedTime(currentVideo.scheduled_at)
                : stream.status === 'Live' ? '🔴' : '⚫'
              }
            </span>
          </Badge>
        </div>
      </motion.header>

      {/* Video Player */}
      <motion.div 
        className="relative aspect-video bg-black mx-2 sm:mx-4 lg:mx-8 mt-4 rounded-lg overflow-hidden shadow-lg"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        {stream.status === 'Live' && currentVideo ? (
          <div className="w-full h-full relative">
            <video 
              ref={videoRef}
              className="w-full h-full object-cover"
              controls
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              crossOrigin="anonymous"
              onError={(e) => {
                const videoElement = e.currentTarget;
                console.error('Erreur de lecture vidéo:', e);
                console.error('URL de la vidéo:', videoElement.src);
                console.error('Code d\'erreur:', videoElement.error?.code);
                console.error('Message d\'erreur:', videoElement.error?.message);
                console.error('File path:', currentVideo.videos?.file_path);
              }}
              onLoadStart={() => {
                console.log('Chargement de la vidéo démarré');
                console.log('File path:', currentVideo.videos?.file_path);
              }}
              onLoadedData={() => {
                console.log('Données vidéo chargées avec succès');
                // Force le lancement automatique dès que les données sont chargées
                if (videoRef.current) {
                  videoRef.current.play().catch((error) => {
                    console.log('Autoplay initial bloqué:', error);
                  });
                }
              }}
              onCanPlay={() => {
                console.log('La vidéo peut être lue');
                // Tentative supplémentaire pour garantir le lancement automatique
                if (videoRef.current && videoRef.current.paused) {
                  videoRef.current.play().catch((error) => {
                    console.log('Autoplay différé bloqué:', error);
                  });
                }
              }}
            >
              {/* Source principale avec URL corrigée */}
              <source 
                src={`https://loncayexjrjewmmgxdci.supabase.co/storage/v1/object/public/videos/${currentVideo.videos?.file_path}`}
                type={(() => {
                  const filePath = currentVideo.videos?.file_path || '';
                  const extension = filePath.split('.').pop()?.toLowerCase();
                  switch (extension) {
                    case 'mp4': return 'video/mp4';
                    case 'webm': return 'video/webm';
                    case 'ogg': return 'video/ogg';
                    case 'avi': return 'video/x-msvideo';
                    case 'mov': return 'video/quicktime';
                    case 'wmv': return 'video/x-ms-wmv';
                    case 'flv': return 'video/x-flv';
                    case 'mkv': return 'video/x-matroska';
                    case '3gp': return 'video/3gpp';
                    case 'm4v': return 'video/x-m4v';
                    default: return 'video/mp4';
                  }
                })()}
              />
              
              {/* Fallback pour formats non supportés */}
              <p className="text-white text-center p-4">
                Votre navigateur ne supporte pas ce format vidéo. 
                <br />
                <a 
                  href={`https://loncayexjrjewmmgxdci.supabase.co/storage/v1/object/public/videos/${currentVideo.videos?.file_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-300 underline"
                >
                  Télécharger la vidéo
                </a>
              </p>
            </video>
            
            
            {/* Debug info (visible en dev) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs p-2 rounded">
                <p>File: {currentVideo.videos?.file_path}</p>
                <p>URL: https://loncayexjrjewmmgxdci.supabase.co/storage/v1/object/public/videos/{currentVideo.videos?.file_path}</p>
              </div>
            )}
          </div>
        ) : stream.status === 'Live' ? (
          <div className="w-full h-full relative">
            <img 
              src={getSetting('default_stream_placeholder') || '/default-stream-placeholder.png'}
              alt="Aucune vidéo disponible"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback vers l'interface par défaut si l'image ne charge pas
                const target = e.currentTarget;
                target.style.display = 'none';
                target.parentElement!.innerHTML = `
                  <div class="w-full h-full bg-gradient-to-br from-blue-900 to-blue-600 flex items-center justify-center">
                    <div class="text-center text-white px-4">
                      <div class="w-10 h-10 mx-auto mb-4 opacity-60 flex items-center justify-center">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M23 7l-7 5 7 5V7z" fill="currentColor"/>
                          <rect x="1" y="5" width="15" height="14" rx="2" fill="currentColor"/>
                        </svg>
                      </div>
                      <p class="text-base sm:text-lg font-medium mb-2">En attente de programmation</p>
                      <p class="text-sm opacity-80">Aucune vidéo programmée actuellement</p>
                    </div>
                  </div>
                `;
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end justify-start">
              <div className="text-white p-4">
                <p className="text-sm font-medium mb-1">En attente de programmation</p>
                <p className="text-xs opacity-80">Aucune vidéo programmée actuellement</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <div className="text-center text-gray-400 px-4">
              <Video size={40} className="mx-auto mb-4 opacity-40 sm:w-12 sm:h-12" />
              <p className="text-base sm:text-lg font-medium mb-2">Hot spot hors ligne</p>
              <p className="text-sm opacity-60">Aucune surveillance programmée</p>
            </div>
          </div>
        )}

        {/* Overlay publicitaire */}
        {showAd && currentAd && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center rounded-lg z-10">
            <div className="bg-white p-6 rounded-lg max-w-md mx-4 relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => setShowAd(false)}
              >
                <X className="w-4 h-4" />
              </Button>
              
              {currentAd.image_url && (
                <img 
                  src={currentAd.image_url} 
                  alt={currentAd.title}
                  className="w-full h-40 object-cover rounded mb-4"
                />
              )}
              
              <h3 className="text-lg font-semibold mb-2 text-foreground">{currentAd.title}</h3>
              {currentAd.content_text && (
                <p className="text-muted-foreground text-sm">{currentAd.content_text}</p>
              )}
            </div>
          </div>
        )}
        
        {/* Fullscreen button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 sm:top-4 right-2 sm:right-4 text-white hover:bg-black/20"
        >
          <Maximize2 size={18} className="sm:w-5 sm:h-5" />
        </Button>
      </motion.div>

      {/* Stream Info */}
      <motion.div 
        className="px-4 py-6 sm:px-6 lg:px-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <Card className="bg-gradient-card border-0 shadow-card mb-4">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium">
                  {stream.viewers?.toLocaleString() || 0} spectateurs
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {stream.lastUpdate}
              </span>
            </div>
            
            {stream.description && (
              <p className="text-sm text-muted-foreground mb-3">
                {stream.description}
              </p>
            )}
            
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {stream.type}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {stream.quartier}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              className="w-full flex flex-col gap-1 sm:gap-2 h-auto py-3 sm:py-4"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw size={18} className={`${isRefreshing ? 'animate-spin' : ''} sm:w-5 sm:h-5`} />
              <span className="text-xs sm:text-sm">Actualiser</span>
            </Button>
          </motion.div>

          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              className={`w-full flex flex-col gap-1 sm:gap-2 h-auto py-3 sm:py-4 ${
                isFavorite ? 'bg-destructive/10 text-destructive border-destructive/20' : ''
              }`}
              onClick={handleFavorite}
            >
              <Heart size={18} className={`${isFavorite ? 'fill-current' : ''} sm:w-5 sm:h-5`} />
              <span className="text-xs sm:text-sm">Favoris</span>
            </Button>
          </motion.div>

          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              className="w-full flex flex-col gap-1 sm:gap-2 h-auto py-3 sm:py-4"
              onClick={handleReport}
            >
              <AlertTriangle size={18} className="sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm">Signaler</span>
            </Button>
          </motion.div>
        </div>

        {/* Advertising Card - Remplacé par les publicités de l'admin */}
        {(() => {
          const bannerAds = getActiveAds('banner');
          const displayAd = bannerAds.length > 0 ? bannerAds[0] : null;
          
          return (
            <motion.div 
              className="mt-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <Card className="bg-gradient-card border-0 shadow-card overflow-hidden cursor-pointer hover-scale">
                <CardContent className="p-0">
                  <div className="relative">
                    <img 
                      src={displayAd?.image_url || insuranceAd} 
                      alt={displayAd?.title || "Assurance Auto Kinshasa"} 
                      className="w-full h-32 sm:h-40 lg:h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <Badge className="mb-2 text-xs bg-primary/90 backdrop-blur-sm">
                        Publicité
                      </Badge>
                      <h3 className="text-white font-heading font-semibold text-base sm:text-lg mb-1">
                        {displayAd?.title || "Protégez votre véhicule"}
                      </h3>
                      <p className="text-white/90 text-sm">
                        {displayAd?.content_text || "Assurance auto complète à partir de 50$ par mois. Protection totale garantie."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })()}
      </motion.div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          navigate('/');
        }}
        message="Vous devez vous connecter pour voir le contenu des coins chauds."
      />
    </motion.div>
  );
}