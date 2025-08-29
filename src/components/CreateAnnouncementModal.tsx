import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, VideoIcon } from 'lucide-react';
import { usePoliceAnnouncements } from '@/hooks/usePoliceAnnouncements';

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateAnnouncementModal({ isOpen, onClose }: CreateAnnouncementModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createAnnouncement } = usePoliceAnnouncements();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setVideoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    try {
      setIsSubmitting(true);
      await createAnnouncement(
        {
          title: title.trim(),
          description: description.trim(),
          is_active: true
        },
        imageFile || undefined,
        videoFile || undefined
      );
      
      // Reset form
      setTitle('');
      setDescription('');
      setImageFile(null);
      setImagePreview(null);
      setVideoFile(null);
      setVideoPreview(null);
      onClose();
    } catch (error) {
      console.error('Error creating announcement:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-slate-900/95 backdrop-blur border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Créer une annonce</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white/80">Titre</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de l'annonce..."
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white/80">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de l'annonce..."
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60 min-h-[100px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white/80">Image (optionnelle)</Label>
            
            {imagePreview ? (
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-4">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Aperçu"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 border-red-500 text-white"
                      onClick={handleRemoveImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/10 border-white/20 border-dashed">
                <CardContent className="p-4">
                  <label className="flex flex-col items-center justify-center h-32 cursor-pointer hover:bg-white/5 rounded-lg transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <ImageIcon className="w-8 h-8 text-white/60 mb-2" />
                    <span className="text-white/60 text-sm text-center">
                      Cliquez pour ajouter une image
                    </span>
                  </label>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-white/80">Vidéo (optionnelle)</Label>
            
            {videoPreview ? (
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-4">
                  <div className="relative">
                    <video
                      src={videoPreview}
                      className="w-full h-32 object-cover rounded-lg"
                      controls
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 border-red-500 text-white"
                      onClick={handleRemoveVideo}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/10 border-white/20 border-dashed">
                <CardContent className="p-4">
                  <label className="flex flex-col items-center justify-center h-32 cursor-pointer hover:bg-white/5 rounded-lg transition-colors">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="hidden"
                    />
                    <VideoIcon className="w-8 h-8 text-white/60 mb-2" />
                    <span className="text-white/60 text-sm text-center">
                      Cliquez pour ajouter une vidéo
                    </span>
                  </label>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || !description.trim() || isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? 'Création...' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}