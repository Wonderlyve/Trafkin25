import { motion } from 'framer-motion';
import { AlertTriangle, Clock, MapPin, Users, Car, Construction, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SocialVideoPlayer } from '@/components/SocialVideoPlayer';

export default function Alertes() {
  // Mock data for traffic alerts - replace with real data from your API
  const mockAlerts = [
    {
      id: 1,
      title: 'Accident Rond Pt Huileries',
      description: 'Collision entre deux véhicules bloque la circulation',
      location: 'Rond Point des Huileries',
      time: 'Il y a 5 min',
      severity: 'high',
      type: 'accident',
      icon: Car,
      videoUrl: '/lovable-uploads/b7438fee-0430-4f6f-89c9-d38a0c9189bf.png', // Placeholder until real video
      username: 'TrafKin',
      userAvatar: '/placeholder-avatar.jpg',
      likes: 24,
      comments: 8,
      hasVideo: true
    },
    {
      id: 2,
      title: 'Travaux Pont Matete',
      description: 'Réparation de la chaussée en cours, circulation réduite',
      location: 'Pont Matete',
      time: 'Il y a 15 min',
      severity: 'medium',
      type: 'construction',
      icon: Construction,
      hasVideo: false
    },
    {
      id: 3,
      title: 'Embouteillage Avenue de la Justice',
      description: 'Trafic dense signalé par plusieurs utilisateurs avec vidéo',
      location: 'Avenue de la Justice',
      time: 'Il y a 30 min',
      severity: 'high',
      type: 'traffic',
      icon: Users,
      videoUrl: '/lovable-uploads/b7438fee-0430-4f6f-89c9-d38a0c9189bf.png', // Using uploaded image as placeholder
      username: 'CitoyenKin',
      userAvatar: '/placeholder-avatar.jpg',
      likes: 15,
      comments: 5,
      hasVideo: true
    },
    {
      id: 4,
      title: 'Panne Électrique',
      description: 'Feux de signalisation hors service',
      location: 'Carrefour Pompage',
      time: 'Il y a 45 min',
      severity: 'medium',
      type: 'utility',
      icon: Zap,
      hasVideo: false
    }
  ];

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-destructive text-destructive-foreground';
      case 'medium':
        return 'bg-warning text-warning-foreground';
      case 'low':
        return 'bg-success text-success-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'Critique';
      case 'medium':
        return 'Modéré';
      case 'low':
        return 'Faible';
      default:
        return 'Normal';
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-background p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="h-8 w-8 text-warning" />
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Alertes Trafic
            </h1>
          </div>
          <p className="text-muted-foreground">
            Informations en temps réel sur les incidents de circulation à Kinshasa
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Alertes Critiques</p>
                  <p className="text-2xl font-bold text-foreground">
                    {mockAlerts.filter(a => a.severity === 'high').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Alertes Actives</p>
                  <p className="text-2xl font-bold text-foreground">{mockAlerts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Zones Affectées</p>
                  <p className="text-2xl font-bold text-foreground">
                    {new Set(mockAlerts.map(a => a.location.split(' ')[0])).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Alerts List */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {mockAlerts.map((alert, index) => {
            const IconComponent = alert.icon;
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.3 }}
              >
                 <Card className="hover:shadow-card transition-shadow duration-200">
                   <CardContent className="p-6">
                     {alert.hasVideo ? (
                       // Layout spécial pour les alertes avec vidéo
                       <div className="flex flex-col lg:flex-row gap-6">
                         {/* Lecteur vidéo social */}
                         <div className="flex-shrink-0">
                           <SocialVideoPlayer
                             videoUrl={alert.videoUrl!}
                             username={alert.username!}
                             userAvatar={alert.userAvatar}
                             caption={`${alert.title} - ${alert.description}`}
                             likes={alert.likes}
                             comments={alert.comments}
                             onLike={() => console.log('Like video')}
                             onComment={() => console.log('Comment video')}
                             onShare={() => console.log('Share video')}
                           />
                         </div>

                         {/* Informations de l'alerte */}
                         <div className="flex-1">
                           <div className="flex items-start gap-4 mb-4">
                             <div className={`p-3 rounded-lg ${
                               alert.severity === 'high' ? 'bg-destructive/10' : 
                               alert.severity === 'medium' ? 'bg-warning/10' : 'bg-success/10'
                             }`}>
                               <IconComponent className={`h-6 w-6 ${
                                 alert.severity === 'high' ? 'text-destructive' : 
                                 alert.severity === 'medium' ? 'text-warning' : 'text-success'
                               }`} />
                             </div>
                             <div className="flex-1">
                               <div className="flex items-start justify-between gap-2 mb-2">
                                 <h3 className="font-heading font-semibold text-xl text-foreground">
                                   {alert.title}
                                 </h3>
                                 <Badge className={getSeverityBadge(alert.severity)}>
                                   {getSeverityLabel(alert.severity)}
                                 </Badge>
                               </div>
                               <p className="text-muted-foreground text-lg mb-4">
                                 {alert.description}
                               </p>
                             </div>
                           </div>

                           <div className="flex items-center justify-between">
                             <div className="flex items-center gap-6 text-sm text-muted-foreground">
                               <div className="flex items-center gap-2">
                                 <MapPin size={16} />
                                 <span>{alert.location}</span>
                               </div>
                               <div className="flex items-center gap-2">
                                 <Clock size={16} />
                                 <span>{alert.time}</span>
                               </div>
                             </div>
                             <Button variant="outline" size="sm">
                               Voir sur carte
                             </Button>
                           </div>
                         </div>
                       </div>
                     ) : (
                       // Layout normal pour les alertes sans vidéo
                       <div className="flex items-start justify-between gap-4">
                         <div className="flex items-start gap-4 flex-1">
                           <div className={`p-3 rounded-lg ${
                             alert.severity === 'high' ? 'bg-destructive/10' : 
                             alert.severity === 'medium' ? 'bg-warning/10' : 'bg-success/10'
                           }`}>
                             <IconComponent className={`h-6 w-6 ${
                               alert.severity === 'high' ? 'text-destructive' : 
                               alert.severity === 'medium' ? 'text-warning' : 'text-success'
                             }`} />
                           </div>

                           <div className="flex-1">
                             <div className="flex items-start justify-between gap-2 mb-2">
                               <h3 className="font-heading font-semibold text-lg text-foreground">
                                 {alert.title}
                               </h3>
                               <Badge className={getSeverityBadge(alert.severity)}>
                                 {getSeverityLabel(alert.severity)}
                               </Badge>
                             </div>

                             <p className="text-muted-foreground mb-3">
                               {alert.description}
                             </p>

                             <div className="flex items-center gap-4 text-sm text-muted-foreground">
                               <div className="flex items-center gap-1">
                                 <MapPin size={14} />
                                 <span>{alert.location}</span>
                               </div>
                               <div className="flex items-center gap-1">
                                 <Clock size={14} />
                                 <span>{alert.time}</span>
                               </div>
                             </div>
                           </div>
                         </div>

                         <Button variant="outline" size="sm">
                           Voir sur carte
                         </Button>
                       </div>
                     )}
                   </CardContent>
                 </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Empty state if no alerts */}
        {mockAlerts.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Aucune alerte active
            </h3>
            <p className="text-muted-foreground">
              Toutes les routes sont dégagées pour le moment.
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}