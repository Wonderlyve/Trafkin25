import { motion } from 'framer-motion';
import { Heart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Favorites() {
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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold">Mes Favoris</h1>
          <Button variant="outline" size="icon" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
            <Trash2 size={18} />
          </Button>
        </div>
      </motion.header>

      {/* Empty State */}
      <motion.div 
        className="flex flex-col items-center justify-center px-4 py-16"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-card border-0 shadow-card w-full max-w-sm">
          <CardContent className="p-8 text-center">
            <Heart size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-lg font-heading font-semibold mb-2">Aucun favori</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Ajoutez des flux à vos favoris en appuyant sur le bouton ❤️ dans le lecteur vidéo.
            </p>
            <Button className="w-full">
              Découvrir les flux
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}