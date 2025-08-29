import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, MapPin, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HotSpot {
  id: string;
  name: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  image_url: string | null;
  is_active: boolean;
  traffic_status: 'bouchon' | 'fluide' | 'chargee' | null;
  created_at: string;
}

export function HotSpotsManager() {
  const [hotSpots, setHotSpots] = useState<HotSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSpot, setEditingSpot] = useState<HotSpot | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    latitude: '',
    longitude: '',
    address: '',
    traffic_status: '' as 'bouchon' | 'fluide' | 'chargee' | 'none' | ''
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchHotSpots();
  }, []);

  const fetchHotSpots = async () => {
    try {
      const { data, error } = await supabase
        .from('hot_spots')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHotSpots((data || []) as HotSpot[]);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les coins chauds",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File, hotSpotId: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${hotSpotId}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('hot-spots')
      .upload(fileName, file, { 
        cacheControl: '3600',
        upsert: true 
      });

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('hot-spots')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = imagePreview;

      // Upload new image if selected
      if (selectedImage) {
        const tempId = editingSpot?.id || crypto.randomUUID();
        imageUrl = await uploadImage(selectedImage, tempId);
      }

      const spotData = {
        name: formData.name,
        description: formData.description || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        address: formData.address || null,
        image_url: imageUrl,
        traffic_status: formData.traffic_status === 'none' ? null : formData.traffic_status || null
      };

      if (editingSpot) {
        const { error } = await supabase
          .from('hot_spots')
          .update(spotData)
          .eq('id', editingSpot.id);

        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Coin chaud modifié avec succès"
        });
      } else {
        const { error } = await supabase
          .from('hot_spots')
          .insert([spotData]);

        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Coin chaud créé avec succès"
        });
      }

      resetForm();
      fetchHotSpots();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le coin chaud",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (spot: HotSpot) => {
    setEditingSpot(spot);
    setFormData({
      name: spot.name,
      description: spot.description || '',
      latitude: spot.latitude?.toString() || '',
      longitude: spot.longitude?.toString() || '',
      address: spot.address || '',
      traffic_status: spot.traffic_status || 'none'
    });
    setImagePreview(spot.image_url);
    setSelectedImage(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce coin chaud ?')) return;

    try {
      const { error } = await supabase
        .from('hot_spots')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "Coin chaud supprimé avec succès"
      });
      
      fetchHotSpots();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le coin chaud",
        variant: "destructive"
      });
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('hot_spots')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Succès",
        description: `Coin chaud ${!currentStatus ? 'activé' : 'désactivé'}`
      });
      
      fetchHotSpots();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive"
      });
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      latitude: '',
      longitude: '',
      address: '',
      traffic_status: ''
    });
    setSelectedImage(null);
    setImagePreview(null);
    setEditingSpot(null);
    setIsDialogOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (loading && hotSpots.length === 0) {
    return <div className="text-center py-4">Chargement...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <MapPin className="h-4 w-4 md:h-5 md:w-5" />
              Gestion des Coins Chauds
            </CardTitle>
            <CardDescription className="text-sm">
              Créez et gérez les points stratégiques de surveillance de la ville
            </CardDescription>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()} className="w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Nouveau </span>Coin Chaud
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
              <DialogHeader className="flex-shrink-0 pb-4">
                <DialogTitle>
                  {editingSpot ? 'Modifier' : 'Créer'} un Coin Chaud
                </DialogTitle>
                <DialogDescription>
                  Configurez les informations du point stratégique
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="traffic_status">État de la circulation</Label>
                    <Select 
                      value={formData.traffic_status} 
                      onValueChange={(value: 'bouchon' | 'fluide' | 'chargee' | 'none' | '') => 
                        setFormData(prev => ({ ...prev, traffic_status: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner l'état" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucun</SelectItem>
                        <SelectItem value="fluide">Fluide</SelectItem>
                        <SelectItem value="chargee">Chargée</SelectItem>
                        <SelectItem value="bouchon">Bouchon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="image">Image du lieu</Label>
                    <div className="space-y-3">
                      {imagePreview && (
                        <div className="relative w-full h-40 border-2 border-dashed border-border rounded-lg overflow-hidden">
                          <img 
                            src={imagePreview} 
                            alt="Aperçu" 
                            className="w-full h-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={removeImage}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                          id="image-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {imagePreview ? 'Changer l\'image' : 'Ajouter une image'}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Espace en bas pour le scroll */}
                  <div className="pb-4"></div>
                </div>
                
                <DialogFooter className="flex-shrink-0 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {editingSpot ? 'Modifier' : 'Créer'}
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
                <TableHead className="min-w-[120px]">Nom</TableHead>
                <TableHead className="hidden sm:table-cell min-w-[100px]">Image</TableHead>
                <TableHead className="hidden md:table-cell min-w-[150px]">Adresse</TableHead>
                <TableHead className="hidden lg:table-cell min-w-[180px]">Coordonnées</TableHead>
                <TableHead className="hidden lg:table-cell min-w-[100px]">Circulation</TableHead>
                <TableHead className="min-w-[80px]">Statut</TableHead>
                <TableHead className="min-w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hotSpots.map((spot) => (
                <TableRow key={spot.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-medium text-sm">{spot.name}</div>
                      <div className="md:hidden text-xs text-muted-foreground mt-1">
                        {spot.address || 'Non définie'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {spot.image_url ? (
                      <img 
                        src={spot.image_url} 
                        alt={spot.name}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    {spot.address || 'Non définie'}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs">
                    {spot.latitude && spot.longitude 
                      ? `${spot.latitude.toFixed(4)}, ${spot.longitude.toFixed(4)}`
                      : 'Non définies'
                    }
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {spot.traffic_status && (
                      <Badge 
                        className={`text-xs ${
                          spot.traffic_status === 'bouchon' 
                            ? 'bg-traffic-jam text-traffic-jam-foreground' 
                            : spot.traffic_status === 'fluide'
                            ? 'bg-traffic-flowing text-traffic-flowing-foreground'
                            : 'bg-traffic-heavy text-traffic-heavy-foreground'
                        }`}
                      >
                        {spot.traffic_status === 'bouchon' ? 'Bouchon' : 
                         spot.traffic_status === 'fluide' ? 'Fluide' : 'Chargée'}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={spot.is_active ? "default" : "secondary"}
                      className="cursor-pointer text-xs"
                      onClick={() => toggleStatus(spot.id, spot.is_active)}
                    >
                      {spot.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(spot)}
                        className="text-xs px-2 py-1"
                      >
                        <Edit className="h-3 w-3 sm:mr-1" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(spot.id)}
                        className="text-xs px-2 py-1"
                      >
                        <Trash2 className="h-3 w-3 sm:mr-1" />
                        <span className="hidden sm:inline">Supp</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {hotSpots.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Aucun coin chaud configuré
          </div>
        )}
      </CardContent>
    </Card>
  );
}