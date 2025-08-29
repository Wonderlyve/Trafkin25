import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Settings, User, LogOut, Map, Megaphone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: Map, label: 'Carte', path: '/map' },
  { icon: Star, label: 'Favoris', path: '/favorites' },
  { icon: Settings, label: 'Paramètres', path: '/settings' },
  { icon: User, label: 'Profil', path: '/profile' },
];

const adminMenuItems = [
  { icon: Megaphone, label: 'Publicités', path: '/ads' },
];

export default function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const { user, profile, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const isAdmin = profile?.role === 'admin';

  const handleLogout = async () => {
    try {
      await signOut();
      onClose();
      navigate('/auth');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const displayName = profile?.full_name || profile?.username || user?.email || 'Utilisateur';
  const userEmail = user?.email || 'Non connecté';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Menu */}
          <motion.div
            className="fixed top-0 right-0 h-full w-80 bg-card border-l border-border shadow-floating z-50"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-heading font-semibold">Menu</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X size={20} />
              </Button>
            </div>

            {/* Menu Items */}
            <div className="p-4">
              <div className="space-y-2">
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={item.path}
                        onClick={onClose}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <Icon size={20} className="text-muted-foreground" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
                
                {/* Admin Menu Items */}
                {isAdmin && (
                  <>
                    <div className="border-t border-border my-2 pt-2">
                      <p className="text-xs font-medium text-muted-foreground px-3 pb-2">Administration</p>
                    </div>
                    {adminMenuItems.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <motion.div
                          key={item.path}
                          initial={{ x: 50, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: (menuItems.length + index) * 0.1 }}
                        >
                          <Link
                            to={item.path}
                            onClick={onClose}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                          >
                            <Icon size={20} className="text-primary" />
                            <span className="font-medium">{item.label}</span>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-border my-4" />

              {/* User Section */}
              {isAuthenticated ? (
                <motion.div
                  className="p-3 rounded-lg bg-muted/50"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <User size={20} className="text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                      {profile?.role && (
                        <p className="text-xs text-primary font-medium capitalize">{profile.role}</p>
                      )}
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
                    <LogOut size={16} className="mr-2" />
                    Déconnexion
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  className="p-3 rounded-lg bg-muted/50"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Link to="/auth" onClick={onClose}>
                    <Button variant="outline" size="sm" className="w-full">
                      <User size={16} className="mr-2" />
                      Se connecter
                    </Button>
                  </Link>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                TrafKin v1.0.0
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}