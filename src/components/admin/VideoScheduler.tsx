import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Trash2, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ScheduleData {
  id: string;
  video_id: string;
  scheduled_at: string;
  duration: number;
  is_live: boolean;
  created_at: string;
  videos: {
    title: string;
    hot_spots: { name: string } | null;
  } | null;
}

interface VideoOption {
  id: string;
  title: string;
  hot_spots: { name: string } | null;
}

export function VideoScheduler() {
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const [videos, setVideos] = useState<VideoOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    video_id: '',
    scheduled_at: '',
    duration: '300', // 5 minutes par défaut
    is_live: false,
    traffic_status: ''
  });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchSchedules();
    fetchApprovedVideos();
  }, []);

  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('video_schedule')
        .select(`
          *,
          videos!inner(
            title,
            hot_spots!hot_spot_id(name)
          )
        `)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger la programmation",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          id,
          title,
          hot_spots!hot_spot_id(name)
        `)
        .eq('status', 'approved');

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('video_schedule')
        .insert([{
          video_id: formData.video_id,
          scheduled_at: formData.scheduled_at,
          duration: parseInt(formData.duration),
          is_live: formData.is_live,
          traffic_status: formData.traffic_status === 'aucun' ? null : formData.traffic_status || null
        }]);

      if (error) throw error;

      // Mettre à jour le statut de la vidéo
      await supabase
        .from('videos')
        .update({ status: 'scheduled' })
        .eq('id', formData.video_id);

      // Activer automatiquement le hot spot associé à la vidéo
      const { data: videoData } = await supabase
        .from('videos')
        .select('hot_spot_id')
        .eq('id', formData.video_id)
        .single();

      if (videoData?.hot_spot_id) {
        await supabase
          .from('hot_spots')
          .update({ 
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', videoData.hot_spot_id);
      }

      toast({
        title: "Succès",
        description: "Vidéo programmée avec succès"
      });

      resetForm();
      fetchSchedules();
      fetchApprovedVideos();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de programmer la vidéo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (scheduleId: string, videoId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette programmation ?')) return;

    try {
      const { error } = await supabase
        .from('video_schedule')
        .delete()
        .eq('id', scheduleId);

      if (error) throw error;

      // Remettre le statut de la vidéo à approved
      await supabase
        .from('videos')
        .update({ status: 'approved' })
        .eq('id', videoId);

      toast({
        title: "Succès",
        description: "Programmation supprimée avec succès"
      });

      fetchSchedules();
      fetchApprovedVideos();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la programmation",
        variant: "destructive"
      });
    }
  };

  const toggleLiveStatus = async (scheduleId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('video_schedule')
        .update({ is_live: !currentStatus })
        .eq('id', scheduleId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Diffusion ${!currentStatus ? 'activée' : 'désactivée'}`
      });

      fetchSchedules();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de diffusion",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      video_id: '',
      scheduled_at: '',
      duration: '300',
      is_live: false,
      traffic_status: ''
    });
    setIsDialogOpen(false);
  };

  if (loading && schedules.length === 0) {
    return <div className="text-center py-4">Chargement...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Calendar className="h-4 w-4 md:h-5 md:w-5" />
              Programmation des Vidéos
            </CardTitle>
            <CardDescription className="text-sm">
              Planifiez la diffusion des vidéos approuvées
            </CardDescription>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()} className="w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Programmer</span> une vidéo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Programmer une Vidéo</DialogTitle>
                  <DialogDescription>
                    Configurez les paramètres de diffusion
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="video">Vidéo *</Label>
                    <Select 
                      value={formData.video_id} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, video_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une vidéo" />
                      </SelectTrigger>
                      <SelectContent>
                        {videos.map((video) => (
                          <SelectItem key={video.id} value={video.id}>
                            {video.title} {video.hot_spots?.name && `(${video.hot_spots.name})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="scheduled_at">Date et heure *</Label>
                    <Input
                      id="scheduled_at"
                      type="datetime-local"
                      value={formData.scheduled_at}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="duration">Durée (secondes) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="traffic_status">État de la circulation</Label>
                    <Select 
                      value={formData.traffic_status} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, traffic_status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner l'état de circulation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aucun">Aucun</SelectItem>
                        <SelectItem value="fluide">Fluide</SelectItem>
                        <SelectItem value="charge">Chargé</SelectItem>
                        <SelectItem value="bouchon">Bouchon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={loading || !formData.video_id}>
                    Programmer
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Vidéo</TableHead>
                <TableHead className="hidden md:table-cell min-w-[100px]">Coin chaud</TableHead>
                <TableHead className="hidden lg:table-cell min-w-[150px]">Date programmée</TableHead>
                <TableHead className="hidden lg:table-cell min-w-[80px]">Durée</TableHead>
                <TableHead className="min-w-[100px]">Statut</TableHead>
                <TableHead className="min-w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-medium text-sm">
                        {schedule.videos?.title || 'Vidéo supprimée'}
                      </div>
                      <div className="md:hidden text-xs text-muted-foreground mt-1">
                        {schedule.videos?.hot_spots?.name || 'Non défini'}
                      </div>
                      <div className="lg:hidden text-xs text-muted-foreground">
                        {new Date(schedule.scheduled_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    {schedule.videos?.hot_spots?.name || 'Non défini'}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">
                    {new Date(schedule.scheduled_at).toLocaleString('fr-FR')}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">
                    {Math.floor(schedule.duration / 60)}min {schedule.duration % 60}s
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={schedule.is_live ? "default" : "secondary"}
                      className="cursor-pointer text-xs"
                      onClick={() => toggleLiveStatus(schedule.id, schedule.is_live)}
                    >
                      {schedule.is_live ? (
                        <>
                          <Play className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">En direct</span>
                          <span className="sm:hidden">Live</span>
                        </>
                      ) : (
                        <span className="hidden sm:inline">Programmée</span>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(schedule.id, schedule.video_id)}
                      className="text-xs px-2 py-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {schedules.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Aucune vidéo programmée
          </div>
        )}
      </CardContent>
    </Card>
  );
}