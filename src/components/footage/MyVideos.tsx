import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Video, Eye, Trash2, Clock, CheckCircle, XCircle, Calendar, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface MyVideo {
  id: string;
  title: string;
  description: string | null;
  file_path: string;
  status: string;
  created_at: string;
  hot_spots: { name: string } | null;
}

export function MyVideos() {
  const [videos, setVideos] = useState<MyVideo[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (profile?.id) {
      fetchMyVideos();
    }
  }, [profile]);

  const fetchMyVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          hot_spots:hot_spot_id(name)
        `)
        .eq('uploaded_by', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger vos vidéos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId: string, filePath: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette vidéo ?')) return;

    try {
      // Supprimer le fichier du storage
      const { error: storageError } = await supabase.storage
        .from('videos')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Supprimer l'entrée de la base de données
      const { error: dbError } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId);

      if (dbError) throw dbError;

      toast({
        title: "Succès",
        description: "Vidéo supprimée avec succès"
      });

      fetchMyVideos();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la vidéo",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'En attente', variant: 'secondary' as const, icon: Clock },
      approved: { label: 'Approuvée', variant: 'default' as const, icon: CheckCircle },
      rejected: { label: 'Rejetée', variant: 'destructive' as const, icon: XCircle },
      scheduled: { label: 'Programmée', variant: 'default' as const, icon: Calendar },
      live: { label: 'En direct', variant: 'default' as const, icon: Play }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getVideoUrl = async (filePath: string) => {
    try {
      const { data } = await supabase.storage
        .from('videos')
        .createSignedUrl(filePath, 3600); // URL valide 1 heure

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'accéder à la vidéo",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-4">
          Chargement...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <Video className="h-4 w-4 md:h-5 md:w-5" />
          Mes Vidéos
        </CardTitle>
        <CardDescription className="text-sm">
          Gérez vos vidéos déposées et suivez leur statut
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3 md:space-y-4">
          {videos.map((video) => (
            <div key={video.id} className="border rounded-lg p-3 md:p-4 space-y-2 md:space-y-3">
              <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-start md:space-y-0">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm md:text-lg truncate">{video.title}</h3>
                  {video.description && (
                    <p className="text-xs md:text-sm text-muted-foreground mt-1 line-clamp-2">
                      {video.description}
                    </p>
                  )}
                  <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-4 mt-2 text-xs md:text-sm text-muted-foreground">
                    <span className="truncate">Coin chaud: {video.hot_spots?.name || 'Non défini'}</span>
                    <span className="shrink-0">
                      Déposée le {new Date(video.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-row justify-between items-center md:flex-col md:items-end gap-2">
                  {getStatusBadge(video.status)}
                  <div className="flex gap-1 md:gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => getVideoUrl(video.file_path)}
                      className="h-8 w-8 md:h-9 md:w-9 p-0"
                    >
                      <Eye className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                    {video.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(video.id, video.file_path)}
                        className="h-8 w-8 md:h-9 md:w-9 p-0"
                      >
                        <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {videos.length === 0 && (
            <div className="text-center py-6 md:py-8 text-muted-foreground">
              <Video className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 opacity-50" />
              <p className="text-sm md:text-base">Aucune vidéo déposée</p>
              <p className="text-xs md:text-sm mt-1">Utilisez le formulaire ci-dessus pour déposer votre première vidéo</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}