import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, MapPin, Newspaper, User, LogIn, Camera, Settings, Shield, Users, Video, FileText, Bell, Map, Heart, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { useScreenSize } from '@/hooks/useScreenSize';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { isAuthenticated, isAdmin, isRelay, isPolice } = useAuth();
  const { pendingVideosCount } = useAdminNotifications();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  // Main navigation items
  const mainItems = [
    { title: "Home", url: "/", icon: Home },
    { title: "Carte", url: "/map", icon: Map },
    { title: "Actualités", url: "/actus", icon: Newspaper },
    { title: "Alertes", url: "/alertes", icon: Bell },
    { title: "Nearby", url: "/nearby", icon: MapPin },
    { title: "Favoris", url: "/favorites", icon: Heart },
  ];

  // User-specific items
  const getUserItems = () => {
    if (!isAuthenticated) {
      return [{ title: "Connexion", url: "/auth", icon: LogIn }];
    }

    const items = [{ title: "Profil", url: "/profile", icon: User }];

    if (isAdmin) {
      items.push({ title: "Admin", url: "/admin", icon: Shield });
    } else if (isRelay) {
      items.push({ title: "Footage", url: "/footage", icon: Camera });
    } else if (isPolice) {
      items.push({ title: "QG Police", url: "/qg", icon: Shield });
    }

    items.push({ title: "Paramètres", url: "/settings", icon: Settings });
    
    return items;
  };

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/50";

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent className="pt-40">
        {/* Logo */}
        <div className="p-4 border-b border-sidebar-border">
          {!collapsed && (
            <h1 className="text-xl font-heading font-bold text-sidebar-foreground">
              TrafKin
            </h1>
          )}
          {collapsed && (
            <div className="text-xl font-bold text-sidebar-foreground text-center">
              T
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url} className={getNavCls({ isActive: isActive(item.url) })}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Compte</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {getUserItems().map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url} className={getNavCls({ isActive: isActive(item.url) })}>
                      <div className="relative">
                        <item.icon className="h-4 w-4" />
                        {/* Notification badge for admin */}
                        {item.url === '/admin' && isAdmin && pendingVideosCount > 0 && (
                          <div className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full min-w-4 h-4 flex items-center justify-center font-medium">
                            {pendingVideosCount > 99 ? '99+' : pendingVideosCount}
                          </div>
                        )}
                      </div>
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}