import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Post } from '@/hooks/usePosts';

interface EditPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post | null;
  onPostUpdated: (postId: string, updates: any) => Promise<void>;
}

const postTypes = [
  { value: 'traffic', label: 'Embouteillage' },
  { value: 'incident', label: 'Accident' },
  { value: 'event', label: 'Événement' },
  { value: 'flood', label: 'Inondation' },
  { value: 'construction', label: 'Travaux' },
  { value: 'noise', label: 'Nuisance sonore' },
];

export default function EditPostModal({ open, onOpenChange, post, onPostUpdated }: EditPostModalProps) {
  const [content, setContent] = useState(post?.content || '');
  const [location, setLocation] = useState(post?.location || '');
  const [type, setType] = useState(post?.type || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !content.trim() || !location.trim() || !type) return;

    setIsSubmitting(true);
    try {
      await onPostUpdated(post.id, {
        content: content.trim(),
        location: location.trim(),
        type,
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!post) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Modifier le post</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type">Type d'actualité</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                {postTypes.map((postType) => (
                  <SelectItem key={postType.value} value={postType.value}>
                    {postType.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="location">Localisation</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Avenue de la Paix, Kinshasa"
              required
            />
          </div>

          <div>
            <Label htmlFor="content">Contenu</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Décrivez la situation..."
              rows={4}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!content.trim() || !location.trim() || !type || isSubmitting}
            >
              {isSubmitting ? 'Modification...' : 'Modifier'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}