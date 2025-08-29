import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Mail, Calendar, Shield, Edit3, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: profile?.full_name || '',
    username: profile?.username || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user || !profile) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.full_name,
          username: editForm.username
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setIsEditing(false);
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm({
      full_name: profile?.full_name || '',
      username: profile?.username || ''
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">Vous devez être connecté pour accéder à votre profil.</p>
            <Button onClick={() => navigate('/auth')}>Se connecter</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <motion.header 
        className="bg-gradient-primary text-primary-foreground px-4 py-4"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <h1 className="font-heading font-semibold text-lg">Mon Profil</h1>
            <p className="text-sm text-primary-foreground/80">Gérez vos informations personnelles</p>
          </div>
          {!isEditing && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Edit3 size={20} />
            </Button>
          )}
        </div>
      </motion.header>

      {/* Content */}
      <div className="px-4 py-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <User size={32} className="text-primary-foreground" />
              </div>
              <CardTitle className="text-xl">
                {profile?.full_name || profile?.username || 'Utilisateur'}
              </CardTitle>
              {profile?.role && (
                <Badge className="mx-auto w-fit capitalize">
                  <Shield size={12} className="mr-1" />
                  {profile.role}
                </Badge>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              {isEditing ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nom complet</Label>
                    <Input
                      id="full_name"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Nom d'utilisateur</Label>
                    <Input
                      id="username"
                      value={editForm.username}
                      onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSave} disabled={saving} className="flex-1">
                      <Save size={16} className="mr-2" />
                      {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                    </Button>
                    <Button variant="outline" onClick={handleCancel} disabled={saving}>
                      <X size={16} />
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <Mail size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <User size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Nom complet</p>
                      <p className="text-sm text-muted-foreground">
                        {profile?.full_name || 'Non renseigné'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <User size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Nom d'utilisateur</p>
                      <p className="text-sm text-muted-foreground">
                        {profile?.username || 'Non renseigné'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <Calendar size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Membre depuis</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(profile?.created_at || user.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  {profile?.role && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <Shield size={16} className="text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Rôle</p>
                        <p className="text-sm text-muted-foreground capitalize">{profile.role}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}