import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Plus, Users } from 'lucide-react';

export const PoliceUsersManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    username: '',
    badgeNumber: ''
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call edge function to create police user
      const { data, error } = await supabase.functions.invoke('create-police-user', {
        body: {
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          username: formData.username,
          badgeNumber: formData.badgeNumber
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: "Compte policier créé",
        description: `Le compte de ${formData.fullName} a été créé avec succès`
      });

      setFormData({
        email: '',
        password: '',
        fullName: '',
        username: '',
        badgeNumber: ''
      });
      setIsDialogOpen(false);

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le compte",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Gestion des Comptes Police
        </CardTitle>
        <CardDescription>
          Créer et gérer les comptes des agents de police
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Créer un compte police
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un nouveau compte police</DialogTitle>
                <DialogDescription>
                  Créer un compte pour un agent de police avec accès au QG
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nom complet *</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Agent Dupont"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Nom d'utilisateur *</Label>
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="agent.dupont"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="agent.dupont@police.gov"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe temporaire *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Mot de passe temporaire"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="badgeNumber">Numéro de badge</Label>
                  <Input
                    id="badgeNumber"
                    name="badgeNumber"
                    value={formData.badgeNumber}
                    onChange={handleInputChange}
                    placeholder="P-12345"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? 'Création...' : 'Créer le compte'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-600" />
              <h4 className="font-medium text-blue-900">Informations importantes</h4>
            </div>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Les comptes police ont accès au QG (Quartier Général)</li>
              <li>• Ils peuvent voir tous les signalements et alertes</li>
              <li>• Ils peuvent lancer des interventions</li>
              <li>• Le mot de passe doit être changé lors de la première connexion</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};