import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { VideoUploader } from '@/components/footage/VideoUploader';
import { MyVideos } from '@/components/footage/MyVideos';

export default function Footage() {
  const { isRelay, isAdmin, loading, isAuthenticated } = useAuth();

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

  if (!isRelay && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Accès refusé</CardTitle>
            <CardDescription>
              Seuls les comptes relais et administrateurs peuvent accéder à cette section.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 md:py-6 space-y-4 md:space-y-6">
        <div className="mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Section Footage</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Déposez vos vidéos et associez-les aux coins chauds de la ville
          </p>
        </div>

        <div className="flex flex-col space-y-4 lg:grid lg:gap-6 lg:grid-cols-2 lg:space-y-0">
          <VideoUploader />
          <MyVideos />
        </div>
      </div>
    </div>
  );
}