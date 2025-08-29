import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { HotSpotsManager } from '@/components/admin/HotSpotsManager';
import { RelayUsersManager } from '@/components/admin/RelayUsersManager';
import { PoliceUsersManager } from '@/components/admin/PoliceUsersManager';
import { VideosManager } from '@/components/admin/VideosManager';
import { VideoScheduler } from '@/components/admin/VideoScheduler';
import { GoodAddressesManager } from '@/components/admin/GoodAddressesManager';
import { UpdateAnnouncementsManager } from '@/components/admin/UpdateAnnouncementsManager';
import { StreamPlaceholderManager } from '@/components/admin/StreamPlaceholderManager';

export default function Admin() {
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

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Accès refusé</CardTitle>
            <CardDescription>
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto py-4 px-4">
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-bold">Administration Trafkin</h1>
          <p className="text-sm md:text-base text-muted-foreground">Gérez la régie vidéo et les points stratégiques</p>
        </div>

        <Tabs defaultValue="hotspots" className="space-y-4">
          <div className="overflow-x-auto pb-2">
            <TabsList className="grid w-full grid-cols-8 min-w-[800px] gap-1">
              <TabsTrigger value="hotspots" className="text-xs px-2 py-2 whitespace-nowrap">
                <span className="hidden sm:inline">Coins </span>Chauds
              </TabsTrigger>
              <TabsTrigger value="relays" className="text-xs px-2 py-2 whitespace-nowrap">
                <span className="hidden sm:inline">Comptes </span>Relais
              </TabsTrigger>
              <TabsTrigger value="police" className="text-xs px-2 py-2 whitespace-nowrap">
                <span className="hidden sm:inline">Comptes </span>Police
              </TabsTrigger>
              <TabsTrigger value="videos" className="text-xs px-2 py-2">Vidéos</TabsTrigger>
              <TabsTrigger value="schedule" className="text-xs px-2 py-2 whitespace-nowrap">
                <span className="hidden sm:inline">Programmation</span>
                <span className="sm:hidden">Prog</span>
              </TabsTrigger>
              <TabsTrigger value="addresses" className="text-xs px-2 py-2 whitespace-nowrap">
                <span className="hidden sm:inline">Bonnes </span>Adresses
              </TabsTrigger>
              <TabsTrigger value="updates" className="text-xs px-2 py-2 whitespace-nowrap">
                <span className="hidden sm:inline">Annonces </span>MAJ
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-xs px-2 py-2 whitespace-nowrap">
                <span className="hidden sm:inline">Paramètres</span>
                <span className="sm:hidden">Config</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="hotspots" className="mt-4">
            <HotSpotsManager />
          </TabsContent>

          <TabsContent value="relays" className="mt-4">
            <RelayUsersManager />
          </TabsContent>

          <TabsContent value="police" className="mt-4">
            <PoliceUsersManager />
          </TabsContent>

          <TabsContent value="videos" className="mt-4">
            <VideosManager />
          </TabsContent>

          <TabsContent value="schedule" className="mt-4">
            <VideoScheduler />
          </TabsContent>

          <TabsContent value="addresses" className="mt-4">
            <GoodAddressesManager />
          </TabsContent>

          <TabsContent value="updates" className="mt-4">
            <UpdateAnnouncementsManager />
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <StreamPlaceholderManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}