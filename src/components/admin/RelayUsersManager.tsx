import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RelayUser {
  id: string;
  user_id: string;
  username: string | null;
  full_name: string | null;
  role: string;
  created_at: string;
}

export function RelayUsersManager() {
  const [relayUsers, setRelayUsers] = useState<RelayUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<RelayUser | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    full_name: ''
  });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchRelayUsers();
  }, []);

  const fetchRelayUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['relay', 'admin'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRelayUsers(data || []);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs relais",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingUser) {
        // Update existing user profile
        const { error } = await supabase
          .from('profiles')
          .update({
            username: formData.username,
            full_name: formData.full_name
          })
          .eq('id', editingUser.id);

        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Utilisateur modifié avec succès"
        });
      } else {
        // Create new relay user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              username: formData.username,
              full_name: formData.full_name,
              role: 'relay'
            }
          }
        });

        if (authError) throw authError;
        
        toast({
          title: "Succès",
          description: "Compte relais créé avec succès"
        });
      }

      resetForm();
      fetchRelayUsers();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder l'utilisateur",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: RelayUser) => {
    setEditingUser(user);
    setFormData({
      email: '',
      password: '',
      username: user.username || '',
      full_name: user.full_name || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    try {
      // Note: In a real application, you might want to create an admin function
      // to properly delete users from the auth system
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "Utilisateur supprimé avec succès"
      });
      
      fetchRelayUsers();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      username: '',
      full_name: ''
    });
    setEditingUser(null);
    setIsDialogOpen(false);
  };

  if (loading && relayUsers.length === 0) {
    return <div className="text-center py-4">Chargement...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Users className="h-4 w-4 md:h-5 md:w-5" />
              Gestion des Comptes Relais
            </CardTitle>
            <CardDescription className="text-sm">
              Créez et gérez les comptes relais pour le dépôt de vidéos
            </CardDescription>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()} className="w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Nouveau </span>Compte Relais
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingUser ? 'Modifier' : 'Créer'} un Compte Relais
                  </DialogTitle>
                  <DialogDescription>
                    Configurez les informations du compte relais
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  {!editingUser && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password">Mot de passe *</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                          required
                        />
                      </div>
                    </>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">Nom d'utilisateur *</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nom complet *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {editingUser ? 'Modifier' : 'Créer'}
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
                <TableHead className="min-w-[140px]">Nom d'utilisateur</TableHead>
                <TableHead className="hidden md:table-cell min-w-[140px]">Nom complet</TableHead>
                <TableHead className="min-w-[80px]">Rôle</TableHead>
                <TableHead className="hidden lg:table-cell min-w-[120px]">Date</TableHead>
                <TableHead className="min-w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {relayUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-medium text-sm">{user.username}</div>
                      <div className="md:hidden text-xs text-muted-foreground mt-1">
                        {user.full_name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    {user.full_name}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                      {user.role === 'admin' ? 'Admin' : 'Relais'}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs">
                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(user)}
                        className="text-xs px-2 py-1"
                      >
                        <Edit className="h-3 w-3 sm:mr-1" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                      {user.role !== 'admin' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(user.user_id)}
                          className="text-xs px-2 py-1"
                        >
                          <Trash2 className="h-3 w-3 sm:mr-1" />
                          <span className="hidden sm:inline">Supp</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {relayUsers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Aucun compte relais configuré
          </div>
        )}
      </CardContent>
    </Card>
  );
}