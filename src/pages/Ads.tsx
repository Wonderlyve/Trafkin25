import { useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAds, type Ad } from '@/hooks/useAds';
import { useAuth } from '@/hooks/useAuth';
import { AdForm } from '@/components/AdForm';

export default function Ads() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { ads, loading, createAd, updateAd, deleteAd } = useAds();
  
  // États du composant - doivent être déclarés avant les returns conditionnels
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    content_text: '',
    ad_type: 'banner' as Ad['ad_type'],
    position: 'top' as Ad['position'],
    display_duration: 5,
    is_active: true
  });
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  // Rediriger vers l'authentification si non connecté
  if (!authLoading && !isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Afficher un loader pendant le chargement de l'authentification
  if (authLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <div className="text-muted-foreground">Vérification de l'authentification...</div>
        </div>
      </div>
    );
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      content_text: '',
      ad_type: 'banner',
      position: 'top',
      display_duration: 5,
      is_active: true
    });
    setSelectedImageFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAd) {
        await updateAd(editingAd.id, formData, selectedImageFile || undefined);
        setEditingAd(null);
      } else {
        await createAd(formData, selectedImageFile || undefined);
        setIsCreateModalOpen(false);
      }
      resetForm();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleEdit = (ad: Ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      description: ad.description || '',
      image_url: ad.image_url || '',
      content_text: ad.content_text || '',
      ad_type: ad.ad_type,
      position: ad.position,
      display_duration: ad.display_duration,
      is_active: ad.is_active
    });
    setSelectedImageFile(null);
  };

  const toggleAdStatus = async (ad: Ad) => {
    await updateAd(ad.id, { is_active: !ad.is_active });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette publicité ?')) {
      await deleteAd(id);
    }
  };

  const handleCancel = () => {
    resetForm();
    setEditingAd(null);
    setIsCreateModalOpen(false);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold">Gestion des Publicités</h1>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Publicité
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[95vh] mx-4 w-[calc(100vw-2rem)] sm:w-full">
            <DialogHeader className="pb-4">
              <DialogTitle>Créer une nouvelle publicité</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[calc(95vh-8rem)] pr-2">
              <AdForm 
                formData={formData}
                setFormData={setFormData}
                selectedImageFile={selectedImageFile}
                setSelectedImageFile={setSelectedImageFile}
                editingAd={null}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="text-muted-foreground">Chargement des publicités...</div>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {ads.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <div className="text-muted-foreground">Aucune publicité créée</div>
              </CardContent>
            </Card>
          ) : (
            ads.map((ad) => (
              <Card key={ad.id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg mb-2 break-words">
                        {ad.title}
                      </CardTitle>
                      <div className="flex flex-wrap gap-1 mb-2">
                        <Badge variant={ad.is_active ? "default" : "secondary"} className="text-xs">
                          {ad.is_active ? "Actif" : "Inactif"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {ad.ad_type === 'banner' && 'Bannière'}
                          {ad.ad_type === 'stream_overlay' && 'Overlay Stream'}
                          {ad.ad_type === 'sidebar' && 'Barre latérale'}
                          {ad.ad_type === 'native_card' && 'Carte Native'}
                        </Badge>
                      </div>
                      {ad.description && (
                        <p className="text-sm text-muted-foreground break-words">{ad.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1 sm:gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 sm:h-10 sm:w-10"
                        onClick={() => toggleAdStatus(ad)}
                      >
                        {ad.is_active ? <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" /> : <Eye className="w-3 h-3 sm:w-4 sm:h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 sm:h-10 sm:w-10"
                        onClick={() => handleEdit(ad)}
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 sm:h-10 sm:w-10"
                        onClick={() => handleDelete(ad.id)}
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-sm">
                    <div>
                      <span className="font-medium">Position:</span>
                      <div className="text-muted-foreground">{ad.position}</div>
                    </div>
                    <div>
                      <span className="font-medium">Durée:</span>
                      <div className="text-muted-foreground">{ad.display_duration}s</div>
                    </div>
                    <div>
                      <span className="font-medium">Créé le:</span>
                      <div className="text-muted-foreground">
                        {new Date(ad.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Mis à jour:</span>
                      <div className="text-muted-foreground">
                        {new Date(ad.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  {ad.image_url && (
                    <div className="mt-4">
                      <img 
                        src={ad.image_url} 
                        alt={ad.title}
                        className="w-full max-w-xs sm:max-w-sm rounded-lg object-cover"
                      />
                    </div>
                  )}
                  {ad.content_text && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm break-words">{ad.content_text}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={!!editingAd} onOpenChange={(open) => !open && setEditingAd(null)}>
        <DialogContent className="max-w-lg max-h-[95vh] mx-4 w-[calc(100vw-2rem)] sm:w-full">
          <DialogHeader className="pb-4">
            <DialogTitle>Modifier la publicité</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(95vh-8rem)] pr-2">
            <AdForm 
              formData={formData}
              setFormData={setFormData}
              selectedImageFile={selectedImageFile}
              setSelectedImageFile={setSelectedImageFile}
              editingAd={editingAd}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}