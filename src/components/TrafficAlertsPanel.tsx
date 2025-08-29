import { motion } from 'framer-motion';
import { AlertTriangle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TrafficAlertsPanel() {
  // Mock data for traffic alerts - replace with real data from your API
  const mockAlerts = [
    {
      id: 1,
      title: 'Accident Rond Pt Huileries',
      time: 'Il y a 5 min',
      severity: 'high'
    },
    {
      id: 2,
      title: 'Travaux Pont Matete',
      time: 'Il y a 15 min',
      severity: 'medium'
    },
    {
      id: 3,
      title: 'Manifestation Lemba',
      time: 'Il y a 30 min',
      severity: 'high'
    }
  ];

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-heading text-foreground flex items-center gap-2">
            <AlertTriangle size={20} className="text-warning" />
            Alertes Trafic
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                className="p-3 rounded-lg bg-muted/50 border border-border"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.3 }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-foreground">{alert.title}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock size={12} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{alert.time}</span>
                    </div>
                  </div>
                  <div 
                    className={`w-2 h-2 rounded-full ${
                      alert.severity === 'high' ? 'bg-destructive' : 'bg-warning'
                    }`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Placeholder cards */}
      <div className="space-y-3">
        {[1, 2, 3].map((item) => (
          <Card key={item} className="h-16">
            <CardContent className="p-4">
              <div className="h-2 bg-muted rounded animate-pulse" />
              <div className="h-2 bg-muted rounded animate-pulse mt-2 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}