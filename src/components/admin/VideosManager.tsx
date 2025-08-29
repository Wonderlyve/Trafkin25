import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Video, CheckCircle, XCircle, Clock, Play, Calendar, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VideoData {
  id: string;
  title: string;
  description: string | null;
  file_path: string;
  status: string;
  created_at: string;
  hot_spots: { name: string } | null;
  profiles: { username: string | null } | null;
}

export function VideosManager() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          id,
          title,
          description,
          file_path,
          status,
          created_at,
          hot_spot_id,
          uploaded_by
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch related data separately to avoid relationship conflicts
      const videosWithRelations = await Promise.all(
        (data || []).map(async (video) => {
          const [hotSpotData, profileData] = await Promise.all([
            supabase.from('hot_spots').select('name').eq('id', video.hot_spot_id).single(),
            supabase.from('profiles').select('username').eq('id', video.uploaded_by).single()
          ]);

          return {
            ...video,
            hot_spots: hotSpotData.data,
            profiles: profileData.data
          };
        })
      );

      setVideos(videosWithRelations as VideoData[]);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les vidéos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateVideoStatus = async (videoId: string, newStatus: string) => {
    try {
      const updateData: any = { 
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      // Only set approved_by if status is approved
      if (newStatus === 'approved') {
        const { data: user } = await supabase.auth.getUser();
        if (user.user?.id) {
          // Get the profile ID for the current user
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', user.user.id)
            .single();
          
          if (profile) {
            updateData.approved_by = profile.id;
          }
        }
      }

      const { error } = await supabase
        .from('videos')
        .update(updateData)
        .eq('id', videoId);

      if (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        throw error;
      }

      toast({
        title: "Succès",
        description: `Vidéo ${newStatus === 'approved' ? 'approuvée' : newStatus === 'rejected' ? 'rejetée' : 'mise à jour'}`
      });

      fetchVideos();
    } catch (error) {
      console.error('Erreur dans updateVideoStatus:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive"
      });
    }
  };

  const getVideoPreview = async (filePath: string, title: string) => {
    try {
      const { data } = await supabase.storage
        .from('videos')
        .createSignedUrl(filePath, 3600); // URL valide 1 heure

      if (data?.signedUrl) {
        setPreviewUrl(data.signedUrl);
        setPreviewTitle(title);
        setIsPreviewOpen(true);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'accéder à la vidéo",
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
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return <div className="text-center py-4">Chargement...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <Video className="h-4 w-4 md:h-5 md:w-5" />
          Gestion des Vidéos
        </CardTitle>
        <CardDescription className="text-sm">
          Validez et gérez les vidéos déposées par les comptes relais
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Titre</TableHead>
                <TableHead className="hidden md:table-cell min-w-[100px]">Coin chaud</TableHead>
                <TableHead className="hidden lg:table-cell min-w-[100px]">Déposé par</TableHead>
                <TableHead className="min-w-[100px]">Statut</TableHead>
                <TableHead className="hidden lg:table-cell min-w-[100px]">Date</TableHead>
                <TableHead className="min-w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-medium text-sm">{video.title}</div>
                      <div className="md:hidden text-xs text-muted-foreground mt-1">
                        {video.hot_spots?.name || 'Non défini'}
                      </div>
                      <div className="lg:hidden text-xs text-muted-foreground">
                        Par: {video.profiles?.username || 'Inconnu'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    {video.hot_spots?.name || 'Non défini'}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">
                    {video.profiles?.username || 'Inconnu'}
                  </TableCell>
                  <TableCell>{getStatusBadge(video.status)}</TableCell>
                  <TableCell className="hidden lg:table-cell text-xs">
                    {new Date(video.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 sm:flex-row sm:gap-2">
                      {/* Bouton aperçu toujours visible */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => getVideoPreview(video.file_path, video.title)}
                        className="text-xs px-2 py-1"
                      >
                        <Eye className="h-3 w-3 sm:mr-1" />
                        <span className="hidden sm:inline">Aperçu</span>
                        <span className="sm:hidden">👁</span>
                      </Button>
                      
                      {/* Actions de statut */}
                      {video.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateVideoStatus(video.id, 'approved')}
                            className="text-xs px-2 py-1"
                          >
                            <CheckCircle className="h-3 w-3 sm:mr-1" />
                            <span className="hidden sm:inline">Approuver</span>
                            <span className="sm:hidden">✓</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateVideoStatus(video.id, 'rejected')}
                            className="text-xs px-2 py-1"
                          >
                            <XCircle className="h-3 w-3 sm:mr-1" />
                            <span className="hidden sm:inline">Rejeter</span>
                            <span className="sm:hidden">✗</span>
                          </Button>
                        </>
                      )}
                      {video.status !== 'pending' && (
                        <Select
                          value={video.status}
                          onValueChange={(value) => updateVideoStatus(video.id, value)}
                        >
                          <SelectTrigger className="w-24 sm:w-32 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="approved">Approuvée</SelectItem>
                            <SelectItem value="rejected">Rejetée</SelectItem>
                            <SelectItem value="scheduled">Programmée</SelectItem>
                            <SelectItem value="live">En direct</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {videos.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Aucune vidéo disponible
          </div>
        )}
      </CardContent>

      {/* Modal d'aperçu vidéo */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Aperçu de la vidéo: {previewTitle}</DialogTitle>
          </DialogHeader>
          <div className="w-full h-96">
            {previewUrl && (
              <video
                src={previewUrl}
                controls
                className="w-full h-full object-contain"
                preload="metadata"
              >
                Votre navigateur ne supporte pas la lecture de vidéos.
              </video>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}