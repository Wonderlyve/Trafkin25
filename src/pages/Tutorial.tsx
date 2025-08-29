import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { ArrowRight, MapPin, Video, Calendar, Play, Users, Settings, AlertCircle } from 'lucide-react';

export default function Tutorial() {
  const { isAdmin, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Tutoriel Administrateur</h1>
          <p className="text-muted-foreground">Guide complet pour la gestion des coins chauds et diffusion vidéo</p>
        </div>

        {/* Overview Card */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Vue d'ensemble du processus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <MapPin className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">1. Créer le coin chaud</h3>
                  <p className="text-sm text-muted-foreground">Point de surveillance</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <Video className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">2. Valider la vidéo</h3>
                  <p className="text-sm text-muted-foreground">Contenu à diffuser</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <Play className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">3. Programmer</h3>
                  <p className="text-sm text-muted-foreground">Mise en ligne</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 1: Creating Hot Spots */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
              Créer et gérer les coins chauds
            </CardTitle>
            <CardDescription>Points de surveillance stratégiques dans la ville</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="pl-4 border-l-2 border-primary/20">
              <h4 className="font-semibold mb-2">🗺️ Accès à la gestion</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Allez dans <Badge variant="outline">Administration</Badge> → <Badge variant="outline">Coins Chauds</Badge>
              </p>
            </div>

            <div className="pl-4 border-l-2 border-primary/20">
              <h4 className="font-semibold mb-2">➕ Créer un nouveau coin chaud</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Cliquez sur "Ajouter un coin chaud"</li>
                <li>• Saisissez le nom (ex: "Carrefour Victoire")</li>
                <li>• Ajoutez une description détaillée</li>
                <li>• Définissez les coordonnées GPS précises</li>
                <li>• Indiquez l'adresse complète</li>
              </ul>
            </div>

            <div className="pl-4 border-l-2 border-primary/20">
              <h4 className="font-semibold mb-2">🔄 États d'un coin chaud</h4>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline">Inactif</Badge>
                <Badge className="bg-green-500">Actif</Badge>
                <Badge className="bg-red-500">Live</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Un coin chaud devient "Live" quand il est actif ET qu'une vidéo est programmée pour diffusion
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Video Management */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
              Gestion des vidéos
            </CardTitle>
            <CardDescription>Validation et préparation du contenu à diffuser</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="pl-4 border-l-2 border-primary/20">
              <h4 className="font-semibold mb-2">📹 Réception des vidéos</h4>
              <p className="text-sm text-muted-foreground">
                Les utilisateurs <Badge variant="secondary">Relais</Badge> peuvent envoyer des vidéos via l'application
              </p>
            </div>

            <div className="pl-4 border-l-2 border-primary/20">
              <h4 className="font-semibold mb-2">✅ Processus de validation</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Allez dans <Badge variant="outline">Administration</Badge> → <Badge variant="outline">Vidéos</Badge></li>
                <li>• Visualisez les vidéos en attente</li>
                <li>• Vérifiez le contenu et la qualité</li>
                <li>• Statuts possibles :</li>
              </ul>
              <div className="flex gap-2 flex-wrap mt-2">
                <Badge variant="outline">En attente</Badge>
                <Badge className="bg-green-500">Approuvée</Badge>
                <Badge className="bg-blue-500">Programmée</Badge>
                <Badge className="bg-red-500">Rejetée</Badge>
              </div>
            </div>

            <div className="pl-4 border-l-2 border-primary/20">
              <h4 className="font-semibold mb-2">🎯 Attribution aux coins chauds</h4>
              <p className="text-sm text-muted-foreground">
                Chaque vidéo approuvée doit être associée à un coin chaud spécifique pour la diffusion
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Scheduling */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
              Programmation et diffusion
            </CardTitle>
            <CardDescription>Planifier la mise en ligne des vidéos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="pl-4 border-l-2 border-primary/20">
              <h4 className="font-semibold mb-2">📅 Programmer une diffusion</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Allez dans <Badge variant="outline">Administration</Badge> → <Badge variant="outline">Programmation</Badge></li>
                <li>• Cliquez sur "Programmer une vidéo"</li>
                <li>• Sélectionnez une vidéo approuvée</li>
                <li>• Définissez la date et heure de diffusion</li>
                <li>• Configurez la durée de diffusion</li>
              </ul>
            </div>

            <div className="pl-4 border-l-2 border-primary/20">
              <h4 className="font-semibold mb-2">🔴 Contrôle de la diffusion</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Vous pouvez activer/désactiver la diffusion en temps réel en cliquant sur le statut :
              </p>
              <div className="flex gap-2">
                <Badge className="bg-green-500">
                  <Play className="h-3 w-3 mr-1" />
                  En direct
                </Badge>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <Badge variant="secondary">Programmée</Badge>
              </div>
            </div>

            <div className="pl-4 border-l-2 border-primary/20">
              <h4 className="font-semibold mb-2">👥 Visualisation utilisateur</h4>
              <p className="text-sm text-muted-foreground">
                Quand une vidéo est programmée et active, les utilisateurs verront le coin chaud avec le statut 
                <Badge className="bg-red-500 ml-1">Live</Badge> sur la carte et pourront accéder au stream
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Step 4: Monitoring */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">4</span>
              Surveillance et maintenance
            </CardTitle>
            <CardDescription>Suivi des performances et gestion continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="pl-4 border-l-2 border-primary/20">
              <h4 className="font-semibold mb-2">📊 Statistiques de diffusion</h4>
              <p className="text-sm text-muted-foreground">
                Le système génère automatiquement des statistiques de viewership pour chaque coin chaud actif
              </p>
            </div>

            <div className="pl-4 border-l-2 border-primary/20">
              <h4 className="font-semibold mb-2">🔧 Gestion des utilisateurs relais</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Validez les comptes relais dans <Badge variant="outline">Comptes Relais</Badge></li>
                <li>• Attribuez les permissions appropriées</li>
                <li>• Surveillez l'activité des contributeurs</li>
              </ul>
            </div>

            <div className="pl-4 border-l-2 border-primary/20">
              <h4 className="font-semibold mb-2">⚠️ Points d'attention</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Vérifiez régulièrement l'état des coins chauds</li>
                <li>• Surveillez la qualité des vidéos soumises</li>
                <li>• Maintenez un planning de diffusion cohérent</li>
                <li>• Répondez rapidement aux signalements utilisateurs</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Actions rapides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">🚀 Pour mettre un coin chaud en ligne immédiatement :</h4>
                <ol className="text-sm text-muted-foreground space-y-1">
                  <li>1. Créez/activez le coin chaud</li>
                  <li>2. Sélectionnez une vidéo approuvée</li>
                  <li>3. Programmez pour maintenant</li>
                  <li>4. Activez la diffusion</li>
                </ol>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">🎬 Pour planifier une diffusion :</h4>
                <ol className="text-sm text-muted-foreground space-y-1">
                  <li>1. Préparez le contenu vidéo</li>
                  <li>2. Validez et approuvez</li>
                  <li>3. Utilisez la programmation</li>
                  <li>4. Le système activera automatiquement</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}