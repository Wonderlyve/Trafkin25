import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, Camera, Car, AlertTriangle, Droplets, Users, Construction, Volume2, Upload, Loader2, VideoIcon, Star, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostCreated: (post: {
    user_name: string;
    avatar: string;
    location: string;
    type: string;
    content: string;
    image_url?: string;
    video_url?: string;
    is_sponsored?: boolean;
    sponsor_url?: string;
  }) => void;
}

const signalTypes = [
  { id: 'traffic', label: 'Embouteillage', icon: Car, color: 'bg-orange-500' },
  { id: 'incident', label: 'Accident', icon: AlertTriangle, color: 'bg-red-500' },
  { id: 'flood', label: 'Inondation', icon: Droplets, color: 'bg-blue-500' },
  { id: 'construction', label: 'Travaux', icon: Construction, color: 'bg-yellow-500' },
  { id: 'event', label: 'Événement', icon: Users, color: 'bg-purple-500' },
  { id: 'noise', label: 'Nuisance sonore', icon: Volume2, color: 'bg-gray-500' }
];

const adminSignalTypes = [
  { id: 'native_ads', label: 'Native ads', icon: Star, color: 'bg-gradient-to-r from-yellow-400 to-orange-500' }
];

export default function CreatePostModal({ open, onOpenChange, onPostCreated }: CreatePostModalProps) {
  const [selectedType, setSelectedType] = useState<string>('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [sponsorUrl, setSponsorUrl] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { profile, isAuthenticated, isAdmin } = useAuth();

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedType('');
      setContent('');
      setLocation('');
      setSponsorUrl('');
      setSelectedImage(null);
      setImagePreview(null);
      setSelectedVideo(null);
      setVideoPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (videoInputRef.current) {
        videoInputRef.current.value = '';
      }
    }
  }, [open]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Erreur",
          description: "L'image ne doit pas dépasser 5MB",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit for videos
        toast({
          title: "Erreur",
          description: "La vidéo ne doit pas dépasser 50MB",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedVideo(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setVideoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedImage || !profile) return null;

    const fileExt = selectedImage.name.split('.').pop();
    const fileName = `${profile.user_id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('post-images')
      .upload(fileName, selectedImage);

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('post-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const uploadVideo = async (): Promise<string | null> => {
    if (!selectedVideo || !profile) return null;

    const fileExt = selectedVideo.name.split('.').pop();
    const fileName = `${profile.user_id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('videos')
      .upload(fileName, selectedVideo);

    if (error) {
      console.error('Video upload error:', error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour créer une actualité",
        variant: "destructive"
      });
      return;
    }

    if (!selectedType || !content || !location) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    if (selectedType === 'native_ads' && !sponsorUrl) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir l'URL du site pour les Native ads",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      let imageUrl = null;
      let videoUrl = null;
      
      if (selectedImage) {
        imageUrl = await uploadImage();
      }
      
      if (selectedVideo) {
        videoUrl = await uploadVideo();
      }

      const userName = profile?.full_name || profile?.username || 'Utilisateur';
      const avatar = userName.split(' ').map(n => n[0]).join('').toUpperCase();

      // Créer le nouveau post
      const newPost = {
        user_name: userName,
        avatar: avatar,
        location: location,
        type: selectedType,
        content: content,
        image_url: imageUrl,
        video_url: videoUrl,
        is_sponsored: selectedType === 'native_ads',
        sponsor_url: selectedType === 'native_ads' ? sponsorUrl : undefined
      };

      await onPostCreated(newPost);

      // Reset du formulaire seulement si la création a réussi
      // Note: le reset et la fermeture de la modal sont maintenant gérés
      // dans la page parent selon le résultat de createPost
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'actualité",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-heading font-bold text-center">
            Nouvelle actualité
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1 pr-3">
          <div className="space-y-6">
            {/* Type de signalisation */}
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">
                Type de signalisation *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {signalTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedType === type.id;
                  
                  return (
                    <motion.button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-8 h-8 rounded-full ${type.color} flex items-center justify-center`}>
                          <Icon size={16} className="text-white" />
                        </div>
                        <span className="text-xs font-medium text-center">{type.label}</span>
                      </div>
                    </motion.button>
                  );
                })}
                
                {/* Options admin uniquement */}
                {isAdmin && adminSignalTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedType === type.id;
                  
                  return (
                    <motion.button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-8 h-8 rounded-full ${type.color} flex items-center justify-center`}>
                          <Icon size={16} className="text-white" />
                        </div>
                        <span className="text-xs font-medium text-center">{type.label}</span>
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          Admin
                        </Badge>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Nom d'utilisateur (automatique) */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Publié par
              </label>
              <div className="px-3 py-2 bg-muted rounded-md text-sm text-muted-foreground">
                {profile?.full_name || profile?.username || 'Utilisateur connecté'}
              </div>
            </div>

            {/* Localisation */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Localisation *
              </label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-3 text-muted-foreground" />
                <Textarea
                  placeholder="Ex: Rond-point Victoire, Boulevard du 30 juin..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10 min-h-[40px] max-h-[40px] resize-none"
                />
              </div>
            </div>

            {/* Contenu */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Description *
              </label>
              <Textarea
                placeholder={selectedType === 'native_ads' ? "Décrivez le contenu sponsorisé..." : "Décrivez la situation (état du trafic, détails sur l'incident, etc.)"}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {/* URL du site (uniquement pour native ads) */}
            {selectedType === 'native_ads' && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  URL du site *
                </label>
                <div className="relative">
                  <ExternalLink size={16} className="absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    placeholder="https://exemple.com"
                    value={sponsorUrl}
                    onChange={(e) => setSponsorUrl(e.target.value)}
                    className="pl-10"
                    type="url"
                  />
                </div>
              </div>
            )}

            {/* Photo (optionnel) */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Photo (optionnel)
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                <Upload size={16} className="mr-2" />
                {selectedImage ? 'Changer la photo' : 'Ajouter une photo'}
              </Button>
              
              {imagePreview && (
                <div className="mt-3 relative">
                  <img 
                    src={imagePreview} 
                    alt="Aperçu" 
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                  >
                    <X size={14} />
                  </Button>
                </div>
              )}
            </div>

            {/* Vidéo (optionnel) */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Vidéo (optionnel)
              </label>
              <input
                type="file"
                ref={videoInputRef}
                onChange={handleVideoSelect}
                accept="video/*"
                className="hidden"
              />
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => videoInputRef.current?.click()}
                type="button"
              >
                <VideoIcon size={16} className="mr-2" />
                {selectedVideo ? 'Changer la vidéo' : 'Ajouter une vidéo'}
              </Button>
              
              {videoPreview && (
                <div className="mt-3 relative">
                  <video 
                    src={videoPreview} 
                    className="w-full h-32 object-cover rounded-lg"
                    controls
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setSelectedVideo(null);
                      setVideoPreview(null);
                      if (videoInputRef.current) {
                        videoInputRef.current.value = '';
                      }
                    }}
                  >
                    <X size={14} />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-3 pt-4 flex-shrink-0">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            className="flex-1"
            disabled={!selectedType || !content || !location || uploading || !isAuthenticated || (selectedType === 'native_ads' && !sponsorUrl)}
          >
            {uploading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Publication...
              </>
            ) : (
              'Publier'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}