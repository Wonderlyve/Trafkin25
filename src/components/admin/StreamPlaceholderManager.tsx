import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Eye, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppSettings } from '@/hooks/useAppSettings';
import { supabase } from '@/integrations/supabase/client';

export function StreamPlaceholderManager() {
  const { toast } = useToast();
  const { getSetting, updateSetting, loading } = useAppSettings();
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');

  const defaultImageUrl = getSetting('default_stream_placeholder') || '/default-stream-placeholder.png';

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier image valide.",
        variant: "destructive"
      });
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erreur", 
        description: "L'image ne doit pas dépasser 5MB.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `stream-placeholder-${Date.now()}.${fileExt}`;
      const filePath = `placeholders/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('hot-spots')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('hot-spots')
        .getPublicUrl(filePath);

      setCurrentImageUrl(data.publicUrl);
      
      toast({
        title: "Succès",
        description: "Image téléchargée avec succès. Cliquez sur Enregistrer pour l'activer.",
      });

    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger l'image.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!currentImageUrl) return;

    setSaving(true);
    
    try {
      const success = await updateSetting('default_stream_placeholder', currentImageUrl);
      
      if (success) {
        toast({
          title: "Succès",
          description: "Image par défaut mise à jour avec succès.",
        });
        setCurrentImageUrl('');
      } else {
        throw new Error('Échec de la mise à jour');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'image par défaut.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Image par défaut des streams
        </CardTitle>
        <CardDescription>
          Gérez l'image affichée quand aucune vidéo n'est disponible pour un hot spot.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Image actuelle */}
        <div>
          <Label className="text-sm font-medium">Image actuelle</Label>
          <div className="mt-2 border border-dashed border-muted-foreground/25 rounded-lg p-4">
            <img 
              src={defaultImageUrl} 
              alt="Image par défaut actuelle"
              className="w-full max-w-md h-40 object-cover rounded mx-auto"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          </div>
        </div>

        {/* Nouvelle image téléchargée */}
        {currentImageUrl && (
          <div>
            <Label className="text-sm font-medium">Nouvelle image (en attente de sauvegarde)</Label>
            <div className="mt-2 border border-dashed border-primary/25 rounded-lg p-4">
              <img 
                src={currentImageUrl} 
                alt="Nouvelle image"
                className="w-full max-w-md h-40 object-cover rounded mx-auto"
              />
            </div>
          </div>
        )}

        {/* Upload d'une nouvelle image */}
        <div>
          <Label htmlFor="image-upload" className="text-sm font-medium">
            Télécharger une nouvelle image
          </Label>
          <div className="mt-2">
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Formats supportés: JPG, PNG, GIF, WebP. Taille max: 5MB
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            disabled={!currentImageUrl || saving}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "Sauvegarde..." : "Enregistrer la nouvelle image"}
          </Button>

          {uploading && (
            <Button variant="outline" disabled>
              <Upload className="w-4 h-4 animate-spin" />
              Téléchargement...
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
          <p className="font-medium mb-1">Note:</p>
          <p>
            Cette image sera affichée dans le lecteur vidéo quand aucune vidéo n'est programmée 
            pour un hot spot. Elle remplacera le message "En attente de programmation".
          </p>
        </div>
      </CardContent>
    </Card>
  );
}