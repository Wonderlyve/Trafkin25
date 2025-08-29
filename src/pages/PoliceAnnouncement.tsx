import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Calendar, User, VideoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePoliceAnnouncements, PoliceAnnouncement } from '@/hooks/usePoliceAnnouncements';
import { useToast } from '@/hooks/use-toast';

export default function PoliceAnnouncementPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAnnouncementById } = usePoliceAnnouncements();
  const { toast } = useToast();
  const [announcement, setAnnouncement] = useState<PoliceAnnouncement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnnouncement = async () => {
      if (!id) {
        toast({
          title: "Erreur",
          description: "ID d'annonce manquant",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      try {
        const data = await getAnnouncementById(id);
        if (data) {
          setAnnouncement(data);
        } else {
          toast({
            title: "Annonce introuvable",
            description: "Cette annonce n'existe pas ou n'est plus disponible",
            variant: "destructive"
          });
          navigate('/');
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'annonce:', error);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger l'annonce",
          variant: "destructive"
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadAnnouncement();
  }, [id, getAnnouncementById, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Annonce non trouvée</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-primary text-primary-foreground px-4 py-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/')}
            className="bg-primary-foreground text-primary border-2 border-primary-foreground hover:bg-primary-foreground/90"
          >
            <ArrowLeft size={18} />
          </Button>
          <img 
            src="/lovable-uploads/a091066d-04e5-44d3-a11d-06030c42ac16.png"
            alt="Logo Police RDC"
            className="h-10 w-10 object-contain"
          />
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-heading font-bold">Annonce Police</h1>
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <div className="px-4 py-6 pt-[120px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500/20 text-white">
            <CardContent className="p-6">
              {/* Badge */}
              <div className="flex justify-between items-start mb-4">
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                  <Shield className="w-3 h-3 mr-1" />
                  Annonce Officielle
                </Badge>
                <div className="text-right text-sm text-white/80">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(announcement.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-heading font-bold mb-4">
                {announcement.title}
              </h2>


              {/* Video */}
              {announcement.video_url && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <VideoIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">Vidéo d'annonce</span>
                  </div>
                  <div className="rounded-lg overflow-hidden bg-black/20">
                    <video
                      controls
                      autoPlay
                      className="w-full h-64 object-contain"
                    >
                      <source src={announcement.video_url} type="video/mp4" />
                      Votre navigateur ne supporte pas la lecture vidéo.
                    </video>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="prose prose-invert max-w-none">
                <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
                  {announcement.description}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/20">
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <User className="w-3 h-3" />
                  <span>Police Nationale</span>
                </div>
                <div className="text-sm text-white/70">
                  ID: {announcement.id.slice(0, 8)}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}