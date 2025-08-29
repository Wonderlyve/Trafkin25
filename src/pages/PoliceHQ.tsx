import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { usePoliceReports, usePoliceAlerts, usePoliceInterventions, useCreateIntervention } from '@/hooks/usePoliceData';
import { usePoliceAnnouncements } from '@/hooks/usePoliceAnnouncements';
import { supabase } from '@/integrations/supabase/client';
import CreateAnnouncementModal from '@/components/CreateAnnouncementModal';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  MapPin, 
  AlertTriangle, 
  Clock, 
  Users, 
  Activity,
  Car,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Plus,
  Megaphone,
  VideoIcon,
  Eye,
  EyeOff
} from 'lucide-react';

export default function PoliceHQ() {
  const navigate = useNavigate();
  const { isPolice, isAdmin, loading, isAuthenticated, profile } = useAuth();
  const { data: reports, isLoading: reportsLoading } = usePoliceReports();
  const { data: alerts, isLoading: alertsLoading } = usePoliceAlerts();
  const { data: interventions, isLoading: interventionsLoading } = usePoliceInterventions();
  const { announcements, loading: announcementsLoading, updateAnnouncement } = usePoliceAnnouncements();
  const createIntervention = useCreateIntervention();
  const [realtimeAlerts, setRealtimeAlerts] = useState<any[]>([]);
  const [isCreateAnnouncementOpen, setIsCreateAnnouncementOpen] = useState(false);
  const { toast } = useToast();

  // Setup realtime subscriptions for alerts
  useEffect(() => {
    const channel = supabase
      .channel('police-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'police_alerts'
        },
        (payload) => {
          setRealtimeAlerts(prev => [payload.new, ...prev.slice(0, 4)]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'police_reports'
        },
        () => {
          // Refresh reports when new ones are added
          window.location.reload();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <p>Chargement du QG...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (!isPolice && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-900">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Accès refusé</CardTitle>
            <CardDescription className="text-white/80">
              Vous n'avez pas les autorisations nécessaires pour accéder au QG Police.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-600 text-white';
      case 'assigned': return 'bg-blue-500 text-white';
      case 'pending': return 'bg-yellow-500 text-black';
      default: return 'bg-gray-500 text-white';
    }
  };

  const handleIntervention = async (reportId: string) => {
    if (!profile?.id) return;
    createIntervention.mutate({
      report_id: reportId,
      officer_id: profile.id,
      status: 'dispatched'
    });
  };

  const toggleAnnouncementStatus = async (announcementId: string, currentStatus: boolean) => {
    try {
      await updateAnnouncement(announcementId, { is_active: !currentStatus });
      toast({
        title: "Succès",
        description: `Annonce ${!currentStatus ? 'activée' : 'désactivée'} avec succès`,
      });
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      toast({
        title: "Erreur",
        description: "Impossible de changer le statut de l'annonce",
        variant: "destructive",
      });
    }
  };

  const criticalReports = reports?.filter(r => r.severity === 'critical') || [];
  const pendingReports = reports?.filter(r => r.status === 'pending') || [];
  const activeInterventions = interventions?.filter(i => i.status !== 'completed') || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 pb-20">
      {/* Header */}
      <div className="bg-slate-900/90 backdrop-blur border-b border-white/10 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <img 
              src="/lovable-uploads/a091066d-04e5-44d3-a11d-06030c42ac16.png"
              alt="Logo Police RDC"
              className="h-12 w-12 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">QG POLICE</h1>
              <p className="text-blue-200 text-sm">Centre de commandement opérationnel</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Real-time Alerts */}
        {realtimeAlerts.length > 0 && (
          <Alert className="bg-red-600/20 border-red-500 text-white">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>ALERTE TEMPS RÉEL:</strong> {realtimeAlerts[0]?.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div>
                  <p className="text-white/80 text-sm">Urgences</p>
                  <p className="text-2xl font-bold text-white">{criticalReports.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-400" />
                <div>
                  <p className="text-white/80 text-sm">En attente</p>
                  <p className="text-2xl font-bold text-white">{pendingReports.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-white/80 text-sm">Interventions</p>
                  <p className="text-2xl font-bold text-white">{activeInterventions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-400" />  
                <div>
                  <p className="text-white/80 text-sm">Alertes actives</p>
                  <p className="text-2xl font-bold text-white">{alerts?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="reports" className="space-y-4">
          <TabsList className="bg-white/10 backdrop-blur border-white/20">
            <TabsTrigger value="reports" className="data-[state=active]:bg-blue-600">
              Signalements
            </TabsTrigger>
            <TabsTrigger value="map" className="data-[state=active]:bg-blue-600">
              Carte
            </TabsTrigger>
            <TabsTrigger value="interventions" className="data-[state=active]:bg-blue-600">
              Interventions
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-blue-600">
              Alertes
            </TabsTrigger>
            <TabsTrigger value="announcements" className="data-[state=active]:bg-blue-600 relative">
              Annonces
              <Plus className="w-3 h-3 ml-1 opacity-60" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports">
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Signalements en temps réel
                </CardTitle>
                <CardDescription className="text-white/80">
                  Tous les signalements reçus triés par priorité
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reportsLoading ? (
                  <div className="text-center py-8 text-white">Chargement des signalements...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/20">
                          <TableHead className="text-white/80">Type</TableHead>
                          <TableHead className="text-white/80">Titre</TableHead>
                          <TableHead className="text-white/80">Localisation</TableHead>
                          <TableHead className="text-white/80">Gravité</TableHead>
                          <TableHead className="text-white/80">Statut</TableHead>
                          <TableHead className="text-white/80">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reports?.map((report) => (
                          <TableRow key={report.id} className="border-white/10">
                            <TableCell className="text-white">{report.type}</TableCell>
                            <TableCell className="text-white">{report.title}</TableCell>
                            <TableCell className="text-white">{report.location}</TableCell>
                            <TableCell>
                              <Badge className={getSeverityColor(report.severity)}>
                                {report.severity}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(report.status)}>
                                {report.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {report.status === 'pending' && (
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700"
                                  onClick={() => handleIntervention(report.id)}
                                >
                                  <Phone className="h-4 w-4 mr-1" />
                                  Intervention
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="map">
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Carte interactive des incidents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-slate-800 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-blue-400" />
                    <p className="text-lg font-medium">Carte interactive</p>
                    <p className="text-sm text-white/60">Zones de trafic et incidents signalés</p>
                    <div className="mt-4 flex gap-4 justify-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm">Critique</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-sm">Élevé</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Normal</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interventions">
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Interventions en cours
                </CardTitle>
              </CardHeader>
              <CardContent>
                {interventionsLoading ? (
                  <div className="text-center py-8 text-white">Chargement des interventions...</div>
                ) : (
                  <div className="space-y-4">
                    {interventions?.map((intervention) => (
                      <div key={intervention.id} className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-medium">Intervention #{intervention.id.slice(0, 8)}</h4>
                            <p className="text-white/60 text-sm">Démarrée le {new Date(intervention.started_at).toLocaleString()}</p>
                          </div>
                          <Badge className={getStatusColor(intervention.status)}>
                            {intervention.status}
                          </Badge>
                        </div>
                        {intervention.notes && (
                          <p className="text-white/80 text-sm mt-2">{intervention.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Alertes temps réel
                </CardTitle>
              </CardHeader>
              <CardContent>
                {alertsLoading ? (
                  <div className="text-center py-8 text-white">Chargement des alertes...</div>
                ) : (
                  <div className="space-y-4">
                    {alerts?.map((alert) => (
                      <Alert key={alert.id} className="bg-yellow-600/20 border-yellow-500">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-white">
                          <div className="flex items-center justify-between">
                            <div>
                              <strong>{alert.message}</strong>
                              <p className="text-sm">{alert.location}</p>
                            </div>
                            <Badge className={getSeverityColor(alert.priority)}>
                              {alert.priority}
                            </Badge>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="announcements">
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Megaphone className="h-5 w-5" />
                      Annonces Police
                    </CardTitle>
                    <CardDescription className="text-white/80">
                      Gérer les annonces diffusées sur l'application
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setIsCreateAnnouncementOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle annonce
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {announcementsLoading ? (
                  <div className="text-center py-8 text-white">Chargement des annonces...</div>
                ) : (
                  <div className="space-y-4">
                    {announcements.length === 0 ? (
                      <div className="text-center py-12">
                        <Megaphone className="h-12 w-12 text-white/40 mx-auto mb-4" />
                        <p className="text-white/60">Aucune annonce créée</p>
                        <p className="text-white/40 text-sm">Créez votre première annonce pour informer les citoyens</p>
                      </div>
                    ) : (
                      announcements.map((announcement) => (
                        <div key={announcement.id} className="bg-white/5 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="text-white font-medium">{announcement.title}</h4>
                                <Badge className={announcement.is_active ? 'bg-green-600' : 'bg-gray-600'}>
                                  {announcement.is_active ? 'Actif' : 'Inactif'}
                                </Badge>
                                {announcement.video_url && (
                                  <Badge className="bg-purple-600 text-white">
                                    <VideoIcon className="w-3 h-3 mr-1" />
                                    Vidéo
                                  </Badge>
                                )}
                              </div>
                              <p className="text-white/80 text-sm mb-2">{announcement.description}</p>
                              <p className="text-white/60 text-xs">
                                Créé le {new Date(announcement.created_at).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              {announcement.image_url && (
                                <img
                                  src={announcement.image_url}
                                  alt={announcement.title}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              )}
                              <Button
                                size="sm"
                                onClick={() => toggleAnnouncementStatus(announcement.id, announcement.is_active)}
                                className={announcement.is_active 
                                  ? "bg-red-600 hover:bg-red-700 text-white" 
                                  : "bg-green-600 hover:bg-green-700 text-white"
                                }
                              >
                                {announcement.is_active ? (
                                  <>
                                    <EyeOff className="w-4 h-4 mr-1" />
                                    Désactiver
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-4 h-4 mr-1" />
                                    Activer
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                          
                          {/* Video display */}
                          {announcement.video_url && (
                            <div className="mt-3 rounded-lg overflow-hidden">
                              <video
                                src={announcement.video_url}
                                className="w-full h-32 object-cover"
                                controls
                                poster={announcement.image_url}
                              />
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Announcement Modal */}
      <CreateAnnouncementModal
        isOpen={isCreateAnnouncementOpen}
        onClose={() => setIsCreateAnnouncementOpen(false)}
      />
    </div>
  );
}