import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, ExternalLink } from 'lucide-react';
import { useUpdateAnnouncements, UpdateAnnouncement } from '@/hooks/useUpdateAnnouncements';

export const UpdateAnnouncementsManager = () => {
  const {
    announcements,
    loading,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
  } = useUpdateAnnouncements();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<UpdateAnnouncement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    update_link: '',
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      update_link: '',
      is_active: true,
    });
    setEditingAnnouncement(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.update_link.trim()) {
      return;
    }

    try {
      if (editingAnnouncement) {
        await updateAnnouncement(editingAnnouncement.id, formData);
      } else {
        await createAnnouncement(formData);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving announcement:', error);
    }
  };

  const handleEdit = (announcement: UpdateAnnouncement) => {
    setFormData({
      title: announcement.title,
      description: announcement.description,
      update_link: announcement.update_link,
      is_active: announcement.is_active,
    });
    setEditingAnnouncement(announcement);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      await deleteAnnouncement(id);
    }
  };

  const toggleStatus = async (announcement: UpdateAnnouncement) => {
    await updateAnnouncement(announcement.id, {
      is_active: !announcement.is_active,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Annonces de Mise à Jour</h2>
          <p className="text-muted-foreground">
            Gérez les annonces de mise à jour affichées à l'accueil
          </p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Annonce
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
            <DialogHeader className="flex-shrink-0 pb-4">
              <DialogTitle>
                {editingAnnouncement ? 'Modifier' : 'Créer'} une Annonce
              </DialogTitle>
              <DialogDescription>
                Configurez l'annonce de mise à jour
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Titre de l'annonce"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description de la mise à jour"
                    rows={4}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="update_link">Lien de Mise à Jour *</Label>
                  <Input
                    id="update_link"
                    type="url"
                    value={formData.update_link}
                    onChange={(e) => setFormData(prev => ({ ...prev, update_link: e.target.value }))}
                    placeholder="https://example.com/update"
                    required
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Annonce active</Label>
                </div>
                
                <div className="pb-4"></div>
              </div>
              
              <DialogFooter className="flex-shrink-0 pt-4 border-t">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
                <Button type="submit">
                  {editingAnnouncement ? 'Modifier' : 'Créer'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titre</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Créé le</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : announcements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Aucune annonce créée
                </TableCell>
              </TableRow>
            ) : (
              announcements.map((announcement) => (
                <TableRow key={announcement.id}>
                  <TableCell className="font-medium">
                    {announcement.title}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {announcement.description}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={announcement.is_active ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => toggleStatus(announcement)}
                    >
                      {announcement.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(announcement.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(announcement.update_link, '_blank')}
                        title="Voir le lien"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(announcement)}
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(announcement.id)}
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};