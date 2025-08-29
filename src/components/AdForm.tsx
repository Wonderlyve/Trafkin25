import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { type Ad } from '@/hooks/useAds';

interface AdFormProps {
  formData: {
    title: string;
    description: string;
    image_url: string;
    content_text: string;
    ad_type: Ad['ad_type'];
    position: Ad['position'];
    display_duration: number;
    is_active: boolean;
  };
  setFormData: (data: any) => void;
  selectedImageFile: File | null;
  setSelectedImageFile: (file: File | null) => void;
  editingAd: Ad | null;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function AdForm({
  formData,
  setFormData,
  selectedImageFile,
  setSelectedImageFile,
  editingAd,
  onSubmit,
  onCancel
}: AdFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Titre *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="image_file">Image de la publicité</Label>
        <Input
          id="image_file"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setSelectedImageFile(file);
            }
          }}
        />
        {selectedImageFile && (
          <div className="mt-2 text-sm text-muted-foreground">
            Fichier sélectionné: {selectedImageFile.name}
          </div>
        )}
        {editingAd?.image_url && !selectedImageFile && (
          <div className="mt-2">
            <img 
              src={editingAd.image_url} 
              alt="Image actuelle"
              className="max-w-xs rounded-lg"
            />
            <div className="text-sm text-muted-foreground mt-1">Image actuelle</div>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="content_text">
          {formData.ad_type === 'native_card' ? 'URL du site de l\'annonceur *' : 'Texte de la publicité'}
        </Label>
        {formData.ad_type === 'native_card' ? (
          <Input
            id="content_text"
            type="url"
            placeholder="https://exemple.com"
            value={formData.content_text}
            onChange={(e) => setFormData({ ...formData, content_text: e.target.value })}
            required={formData.ad_type === 'native_card'}
          />
        ) : (
          <Textarea
            id="content_text"
            value={formData.content_text}
            onChange={(e) => setFormData({ ...formData, content_text: e.target.value })}
          />
        )}
      </div>

      <div>
        <Label htmlFor="ad_type">Type de publicité</Label>
        <Select value={formData.ad_type} onValueChange={(value: Ad['ad_type']) => setFormData({ ...formData, ad_type: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="banner">Bannière</SelectItem>
            <SelectItem value="stream_overlay">Overlay Streaming</SelectItem>
            <SelectItem value="sidebar">Barre latérale</SelectItem>
            <SelectItem value="native_card">Carte Native</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="position">Position</Label>
        <Select value={formData.position} onValueChange={(value: Ad['position']) => setFormData({ ...formData, position: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="top">Haut</SelectItem>
            <SelectItem value="bottom">Bas</SelectItem>
            <SelectItem value="left">Gauche</SelectItem>
            <SelectItem value="right">Droite</SelectItem>
            <SelectItem value="center">Centre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="duration">Durée d'affichage (secondes)</Label>
        <Input
          id="duration"
          type="number"
          min="1"
          value={formData.display_duration}
          onChange={(e) => setFormData({ ...formData, display_duration: parseInt(e.target.value) || 5 })}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label>Publicité active</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {editingAd ? 'Mettre à jour' : 'Créer'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}