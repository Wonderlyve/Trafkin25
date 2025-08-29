import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Upload, Video } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface HotSpot {
  id: string;
  name: string;
}

export function VideoUploader() {
  const [hotSpots, setHotSpots] = useState<HotSpot[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    hot_spot_id: '',
    file: null as File | null
  });
  
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchHotSpots();
  }, []);

  const fetchHotSpots = async () => {
    try {
      const { data, error } = await supabase
        .from('hot_spots')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setHotSpots(data || []);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les coins chauds",
        variant: "destructive"
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('video/')) {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner un fichier vidéo valide",
          variant: "destructive"
        });
        return;
      }
      
      // Vérifier la taille (limite à 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "Erreur",
          description: "Le fichier est trop volumineux (limite: 100MB)",
          variant: "destructive"
        });
        return;
      }
      
      setFormData(prev => ({ ...prev, file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.file || !formData.title || !formData.hot_spot_id) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Générer un nom de fichier unique
      const fileExt = formData.file.name.split('.').pop();
      const fileName = `${profile?.user_id}/${Date.now()}.${fileExt}`;

      // Simuler la progression d'upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Upload du fichier vers Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, formData.file);

      clearInterval(progressInterval);
      setUploadProgress(95);

      if (uploadError) throw uploadError;

      // Créer l'entrée dans la base de données
      const { error: dbError } = await supabase
        .from('videos')
        .insert([{
          title: formData.title,
          description: formData.description || null,
          file_path: uploadData.path,
          file_size: formData.file.size,
          hot_spot_id: formData.hot_spot_id,
          uploaded_by: profile?.id
        }]);

      if (dbError) throw dbError;

      setUploadProgress(100);
      
      toast({
        title: "Succès",
        description: "Vidéo uploadée avec succès et en attente de validation"
      });

      // Reset du formulaire
      setFormData({
        title: '',
        description: '',
        hot_spot_id: '',
        file: null
      });
      
      // Reset de l'input file
      const fileInput = document.getElementById('video-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'upload",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <Upload className="h-4 w-4 md:h-5 md:w-5" />
          Déposer une Vidéo
        </CardTitle>
        <CardDescription className="text-sm">
          Uploadez vos vidéos et associez-les à un coin chaud
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">Titre *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Titre de la vidéo"
              required
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description de la vidéo"
              rows={3}
              className="text-sm resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hot_spot" className="text-sm font-medium">Coin chaud *</Label>
            <Select 
              value={formData.hot_spot_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, hot_spot_id: value }))}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Sélectionner un coin chaud" />
              </SelectTrigger>
              <SelectContent>
                {hotSpots.map((spot) => (
                  <SelectItem key={spot.id} value={spot.id} className="text-sm">
                    {spot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="video-file" className="text-sm font-medium">Fichier vidéo *</Label>
            <Input
              id="video-file"
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              required
              className="text-sm file:text-sm file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-muted"
            />
            {formData.file && (
              <p className="text-xs text-muted-foreground break-all">
                Fichier sélectionné: {formData.file.name} ({(formData.file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {uploading && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Progression</Label>
              <Progress value={uploadProgress} className="w-full h-2" />
              <p className="text-xs text-muted-foreground">
                Upload en cours... {uploadProgress}%
              </p>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full text-sm h-10 md:h-11" 
            disabled={uploading || !formData.file}
          >
            {uploading ? (
              <>
                <Video className="h-4 w-4 mr-2 animate-pulse" />
                Upload en cours...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Déposer la vidéo
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}