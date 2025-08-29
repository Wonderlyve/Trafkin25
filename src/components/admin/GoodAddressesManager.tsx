import { useState } from 'react';
import { Plus, Edit, Trash2, MapPin, Star, Upload, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useGoodAddresses, GoodAddress } from '@/hooks/useGoodAddresses';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const categories = [
  'Restaurants',
  'Hôtels',
  'Services',
  'Shopping',
  'Loisirs',
  'Transport'
];

const priceRanges = ['$', '$$', '$$$', '$$$$'];

export function GoodAddressesManager() {
  const { addresses, loading, createAddress, updateAddress, deleteAddress } = useGoodAddresses();
  const { toast } = useToast();
  const [editingAddress, setEditingAddress] = useState<GoodAddress | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    address: '',
    latitude: '',
    longitude: '',
    distance: '',
    rating: '',
    price_range: '',
    features: '',
    image_url: '',
    is_active: true
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      address: '',
      latitude: '',
      longitude: '',
      distance: '',
      rating: '',
      price_range: '',
      features: '',
      image_url: '',
      is_active: true
    });
    setEditingAddress(null);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleEdit = (address: GoodAddress) => {
    setEditingAddress(address);
    setFormData({
      name: address.name,
      category: address.category,
      description: address.description || '',
      address: address.address || '',
      latitude: address.latitude?.toString() || '',
      longitude: address.longitude?.toString() || '',
      distance: address.distance || '',
      rating: address.rating.toString(),
      price_range: address.price_range || '',
      features: address.features?.join(', ') || '',
      image_url: address.image_url || '',
      is_active: address.is_active
    });
    setImageFile(null);
    setImagePreview(address.image_url || null);
    setIsDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;
    
    setUploading(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('good-addresses')
        .upload(fileName, imageFile);

      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('good-addresses')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'uploader l'image",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      let imageUrl = formData.image_url;
      
      // Upload new image if selected
      if (imageFile) {
        const uploadedImageUrl = await uploadImage();
        if (uploadedImageUrl) {
          imageUrl = uploadedImageUrl;
        }
      }
      
      const addressData = {
        name: formData.name,
        category: formData.category,
        description: formData.description || null,
        address: formData.address || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        distance: formData.distance || null,
        rating: parseFloat(formData.rating) || 0,
        price_range: formData.price_range || null,
        features: formData.features ? formData.features.split(',').map(f => f.trim()).filter(f => f) : [],
        image_url: imageUrl,
        is_active: formData.is_active
      };

      if (editingAddress) {
        await updateAddress(editingAddress.id, addressData);
      } else {
        await createAddress(addressData);
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving address:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette bonne adresse ?')) {
      await deleteAddress(id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg sm:text-xl">Gestion des Bonnes Adresses</CardTitle>
            <CardDescription className="text-sm">
              Gérez les bonnes adresses affichées dans l'application
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Ajouter</span>
                <span className="sm:hidden">Nouveau</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg">
                  {editingAddress ? 'Modifier' : 'Ajouter'} une bonne adresse
                </DialogTitle>
                <DialogDescription className="text-sm">
                  Complétez les informations de la bonne adresse
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nom *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Catégorie *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="latitude" className="text-sm">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude" className="text-sm">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="distance" className="text-sm">Distance</Label>
                    <Input
                      id="distance"
                      placeholder="ex: 1.2 km"
                      value={formData.distance}
                      onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rating" className="text-sm">Note (0-5)</Label>
                    <Input
                      id="rating"
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price_range" className="text-sm">Gamme de prix</Label>
                    <Select value={formData.price_range} onValueChange={(value) => setFormData({ ...formData, price_range: value })}>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {priceRanges.map((range) => (
                          <SelectItem key={range} value={range}>
                            {range}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="features">Caractéristiques (séparées par des virgules)</Label>
                  <Input
                    id="features"
                    placeholder="ex: Parking, WiFi, Terrasse"
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="image">Image</Label>
                  <div className="space-y-4">
                    {imagePreview && (
                      <div className="relative w-32 h-32">
                        <img 
                          src={imagePreview} 
                          alt="Aperçu" 
                          className="w-full h-full object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => {
                            setImagePreview(null);
                            setImageFile(null);
                            setFormData({ ...formData, image_url: '' });
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="flex-1"
                      />
                      <Upload className="h-4 w-4 text-muted-foreground" />
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      Formats acceptés: JPG, PNG, WEBP. Taille max: 5MB
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Actif</Label>
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                    Annuler
                  </Button>
                  <Button type="submit" disabled={uploading} className="w-full sm:w-auto">
                    {uploading ? 'Traitement...' : (editingAddress ? 'Modifier' : 'Créer')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {addresses.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucune bonne adresse trouvée. Ajoutez-en une !
            </p>
          ) : (
            addresses.map((address) => (
              <Card key={address.id} className="bg-muted/50">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    {address.image_url && (
                      <div className="w-20 h-20 sm:w-16 sm:h-16 mx-auto sm:mx-0 flex-shrink-0">
                        <img 
                          src={address.image_url} 
                          alt={address.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h3 className="font-semibold text-sm sm:text-base truncate">{address.name}</h3>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant={address.is_active ? "default" : "secondary"} className="text-xs">
                            {address.is_active ? "Actif" : "Inactif"}
                          </Badge>
                          <Badge variant="outline" className="text-xs">{address.category}</Badge>
                        </div>
                      </div>
                      
                      {address.description && (
                        <p className="text-sm text-muted-foreground mb-2">{address.description}</p>
                      )}
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-2">
                        {address.address && (
                          <div className="flex items-center gap-1">
                            <MapPin size={12} />
                            <span className="truncate">{address.address}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          {address.rating > 0 && (
                            <div className="flex items-center gap-1">
                              <Star size={12} className="fill-yellow-400 text-yellow-400" />
                              <span>{address.rating}</span>
                            </div>
                          )}
                          {address.distance && (
                            <span>{address.distance}</span>
                          )}
                          {address.price_range && (
                            <span className="font-medium">{address.price_range}</span>
                          )}
                        </div>
                      </div>

                      {address.features && address.features.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {address.features.map((feature, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-3 sm:mt-0 sm:ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(address)}
                        className="flex-1 sm:flex-none"
                      >
                        <Edit className="w-4 h-4 sm:mr-0" />
                        <span className="ml-1 sm:hidden">Modifier</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(address.id)}
                        className="flex-1 sm:flex-none"
                      >
                        <Trash2 className="w-4 h-4 sm:mr-0" />
                        <span className="ml-1 sm:hidden">Supprimer</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}