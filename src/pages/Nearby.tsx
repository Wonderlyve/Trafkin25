import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Navigation } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGoodAddresses } from '@/hooks/useGoodAddresses';

const categories = [
  { id: 'all', label: 'Tous', active: true },
  { id: 'restaurants', label: 'Restaurants', active: false },
  { id: 'hotels', label: 'Hôtels', active: false },
  { id: 'services', label: 'Services', active: false },
  { id: 'shopping', label: 'Shopping', active: false },
  { id: 'loisirs', label: 'Loisirs', active: false },
  { id: 'transport', label: 'Transport', active: false },
];

export default function Nearby() {
  const [activeCategory, setActiveCategory] = useState('all');
  const { addresses, loading } = useGoodAddresses();

  const filteredPlaces = activeCategory === 'all' 
    ? addresses.filter(addr => addr.is_active)
    : addresses.filter(addr => addr.is_active && addr.category.toLowerCase().includes(activeCategory));

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border shadow-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="px-4 py-4">
          <div className="mb-4">
            <h1 className="text-2xl font-heading font-bold text-foreground">
              Bonnes Adresses
            </h1>
            <div className="flex items-center gap-1 mt-1">
              <MapPin size={14} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Kinshasa, RDC</span>
            </div>
          </div>

          {/* Fixed Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                  activeCategory === category.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {category.label}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.header>

      {/* Scrollable Content */}
      <div className="pt-[156px] px-4 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {filteredPlaces.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Aucune bonne adresse trouvée dans cette catégorie.</p>
              </div>
            ) : (
              filteredPlaces.map((place, index) => (
            <motion.div
              key={place.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-gradient-card border-0 shadow-card overflow-hidden">
                <CardContent className="p-0">
                  {/* Image */}
                  <div className="relative h-48 bg-muted">
                    {place.image_url ? (
                      <img 
                        src={place.image_url} 
                        alt={place.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <MapPin size={48} className="text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-card/90 text-foreground border-0">
                        <Star size={12} className="mr-1 fill-yellow-400 text-yellow-400" />
                        {place.rating}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-heading font-semibold text-lg text-foreground mb-1">
                          {place.name}
                        </h3>
                        <Badge variant="outline" className="text-xs mb-2">
                          {place.category}
                        </Badge>
                      </div>
                      {place.price_range && (
                        <span className="text-sm font-medium text-primary">
                          {place.price_range}
                        </span>
                      )}
                    </div>

                    {place.distance && (
                      <div className="flex items-center gap-1 mb-3">
                        <Navigation size={14} className="text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {place.distance}
                        </span>
                      </div>
                    )}

                    {/* Features */}
                    {place.features && place.features.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {place.features.map((feature, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <Button className="w-full" size="sm">
                      Voir les détails
                    </Button>
                  </div>
                </CardContent>
              </Card>
              </motion.div>
            ))
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}