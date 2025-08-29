import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, MapPin, Newspaper, User, LogIn } from 'lucide-react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { useScreenSize } from '@/hooks/useScreenSize';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/AppSidebar';
import TrafficAlertsPanel from '@/components/TrafficAlertsPanel';

const tabs = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'alertes', label: 'Alertes', icon: Newspaper, path: '/actus' },
  { id: 'nearby', label: 'Nearby', icon: MapPin, path: '/nearby' }
];

export default function Layout() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { isAuthenticated, isAdmin, isRelay, isPolice } = useAuth();
  const { pendingVideosCount } = useAdminNotifications();
  const { isDesktop } = useScreenSize();

  // Reset scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Desktop layout with 3 columns
  if (isDesktop) {
    const isAlertesPage = currentPath === '/alertes';
    
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <div className="pt-40">
            <AppSidebar />
          </div>
          
          <div className="flex-1 flex">
            {/* Sidebar trigger */}
            <div className="absolute top-4 left-4 z-50">
              <SidebarTrigger />
            </div>
            
            {/* Main Content */}
            <main className={`flex-1 ${isAlertesPage ? 'max-w-4xl' : ''} mt-8`}>
              <Outlet />
            </main>
            
            {/* Right panel for Actualités - only show on non-alertes pages */}
            {!isAlertesPage && (
              <div className="w-80 border-l border-border bg-background pt-40">
                <div className="p-4 border-b">
                  <h2 className="font-heading font-semibold text-foreground">
                    Actualités
                  </h2>
                </div>
                <div className="h-full overflow-y-auto">
                  <iframe 
                    src="/actus" 
                    className="w-full h-full border-0"
                    title="Actualités"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </SidebarProvider>
    );
  }

  // Mobile layout
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content */}
      <div className="flex-1 pb-20">
        <Outlet />
      </div>

      {/* Bottom Navigation */}
      <motion.nav 
        className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-floating z-50"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentPath === tab.path;
            
            return (
              <Link
                key={tab.id}
                to={tab.path}
                className="relative flex flex-col items-center py-2 px-4 rounded-lg transition-colors"
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-primary/10 rounded-lg"
                    layoutId="activeTab"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                
                <motion.div
                  className="relative z-10"
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon 
                    size={20} 
                    className={`mb-1 transition-colors ${
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    }`} 
                  />
                  <span 
                    className={`text-xs font-medium transition-colors ${
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {tab.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
          
          {/* Profile/Login/Dashboard Tab */}
          <Link
            to={isAuthenticated ? (isAdmin ? "/admin" : isRelay ? "/footage" : isPolice ? "/qg" : "/settings") : "/auth"}
            className="relative flex flex-col items-center py-2 px-4 rounded-lg transition-colors"
          >
            {((isAuthenticated && isAdmin && currentPath === "/admin") || 
              (isAuthenticated && isRelay && currentPath === "/footage") || 
              (isAuthenticated && isPolice && currentPath === "/qg") ||
              (isAuthenticated && !isAdmin && !isRelay && !isPolice && currentPath === "/settings") || 
              (!isAuthenticated && currentPath === "/auth")) && (
              <motion.div
                className="absolute inset-0 bg-primary/10 rounded-lg"
                layoutId="activeTab"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            
            <motion.div
              className="relative z-10"
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative">
                {isAuthenticated ? (
                  <User 
                    size={20} 
                    className={`mb-1 transition-colors ${
                      (isAdmin && currentPath === "/admin") || 
                      (isRelay && currentPath === "/footage") || 
                      (isPolice && currentPath === "/qg") ||
                      (!isAdmin && !isRelay && !isPolice && currentPath === "/settings") 
                        ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  />
                ) : (
                  <LogIn 
                    size={20} 
                    className={`mb-1 transition-colors ${
                      currentPath === "/auth" ? 'text-primary' : 'text-muted-foreground'
                    }`} 
                  />
                )}
                
                {/* Notification badge for admin */}
                {isAdmin && pendingVideosCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full min-w-5 h-5 flex items-center justify-center font-medium">
                    {pendingVideosCount > 99 ? '99+' : pendingVideosCount}
                  </div>
                )}
              </div>
              <span 
                className={`text-xs font-medium transition-colors ${
                  ((isAuthenticated && isAdmin && currentPath === "/admin") || 
                   (isAuthenticated && isRelay && currentPath === "/footage") || 
                   (isAuthenticated && isPolice && currentPath === "/qg") ||
                   (isAuthenticated && !isAdmin && !isRelay && !isPolice && currentPath === "/settings") || 
                   (!isAuthenticated && currentPath === "/auth")) ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {isAuthenticated ? (isAdmin ? 'Dash' : isRelay ? 'Espace' : isPolice ? 'QG' : 'Profil') : 'Connexion'}
              </span>
            </motion.div>
          </Link>
        </div>
      </motion.nav>
    </div>
  );
}