import { motion } from 'framer-motion';
import { 
  Bell, 
  Globe, 
  Shield, 
  HelpCircle, 
  Info, 
  ChevronRight,
  Moon,
  Volume2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

const settingsGroups = [
  {
    title: 'Général',
    items: [
      { icon: Bell, label: 'Notifications', hasSwitch: true, enabled: true },
      { icon: Volume2, label: 'Son', hasSwitch: true, enabled: false },
      { icon: Moon, label: 'Mode sombre', hasSwitch: true, enabled: false },
      { icon: Globe, label: 'Langue', value: 'Français', hasChevron: true },
    ]
  },
  {
    title: 'Confidentialité',
    items: [
      { icon: Shield, label: 'Données personnelles', hasChevron: true },
      { icon: Shield, label: 'Permissions', hasChevron: true },
    ]
  },
  {
    title: 'Support',
    items: [
      { icon: HelpCircle, label: 'Aide & FAQ', hasChevron: true },
      { icon: Info, label: 'À propos', hasChevron: true },
    ]
  }
];

export default function Settings() {
  return (
    <motion.div 
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <motion.header 
        className="bg-gradient-primary text-primary-foreground px-4 py-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h1 className="text-2xl font-heading font-bold">Paramètres</h1>
      </motion.header>

      {/* Settings Content */}
      <div className="px-4 py-6">
        {settingsGroups.map((group, groupIndex) => (
          <motion.div
            key={group.title}
            className="mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 + groupIndex * 0.1 }}
          >
            <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">
              {group.title.toUpperCase()}
            </h2>
            
            <Card className="bg-gradient-card border-0 shadow-card">
              <CardContent className="p-0">
                {group.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.label}
                      className={`flex items-center justify-between p-4 ${
                        itemIndex !== group.items.length - 1 ? 'border-b border-border/50' : ''
                      }`}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={20} className="text-muted-foreground" />
                        <span className="font-medium">{item.label}</span>
                        {item.value && (
                          <Badge variant="outline" className="text-xs">
                            {item.value}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {item.hasSwitch && (
                          <Switch defaultChecked={item.enabled} />
                        )}
                        {item.hasChevron && (
                          <ChevronRight size={16} className="text-muted-foreground" />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* App Info */}
        <motion.div
          className="text-center pt-8 pb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-sm text-muted-foreground mb-1">TrafKin</p>
          <p className="text-xs text-muted-foreground">Version 1.0.0</p>
        </motion.div>
      </div>
    </motion.div>
  );
}